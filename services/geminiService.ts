
import { GoogleGenAI } from "@google/genai";
import type { Snapshot, ComparisonResult, SnapshotFileCategory } from '../types.ts';
import { SNAPSHOT_CATEGORIES } from '../types.ts';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateComparisonPrompt = (category: SnapshotFileCategory, snapshotAContent: string, snapshotBContent: string): string => {
    const categoryName = SNAPSHOT_CATEGORIES[category];
    return `
You are a senior Windows System Administrator expert in system change analysis.
Your task is to compare two text-based snapshots of a Windows system's ${categoryName}.
"Snapshot A" is the baseline (older) and "Snapshot B" is the new state (newer).

Analyze the provided data and identify all changes.
List all items that were ADDED, REMOVED, or MODIFIED between Snapshot A and Snapshot B.
If there are no changes, state "No changes detected."
Format your response in clear, readable Markdown. Use headings for Added, Removed, and Modified sections.
If a file or entry was modified, try to describe the change if possible (e.g., version number changed, file size changed).

--- SNAPSHOT A (Baseline) ---
${snapshotAContent || "No data provided for this snapshot."}

--- SNAPSHOT B (Newer) ---
${snapshotBContent || "No data provided for this snapshot."}
---

ANALYSIS:
`;
};

async function compareCategory(
    category: SnapshotFileCategory,
    snapshotA: Snapshot,
    snapshotB: Snapshot
): Promise<[SnapshotFileCategory, string]> {
    const contentA = snapshotA.data[category]?.content ?? '';
    const contentB = snapshotB.data[category]?.content ?? '';

    if (!contentA && !contentB) {
        return [category, "No data was provided for this category in either snapshot."];
    }
    
    if (contentA === contentB) {
        return [category, "No changes detected."];
    }

    const prompt = generateComparisonPrompt(category, contentA, contentB);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return [category, response.text];
    } catch (error) {
        console.error(`Error comparing ${category}:`, error);
        return [category, `An error occurred while analyzing the ${SNAPSHOT_CATEGORIES[category]} data.`];
    }
}


export async function compareSnapshots(snapshotA: Snapshot, snapshotB: Snapshot): Promise<ComparisonResult> {
    const categoriesToCompare = Object.keys(SNAPSHOT_CATEGORIES) as SnapshotFileCategory[];
    
    const comparisonPromises = categoriesToCompare.map(category => 
        compareCategory(category, snapshotA, snapshotB)
    );

    const results = await Promise.all(comparisonPromises);
    
    return Object.fromEntries(results);
}
