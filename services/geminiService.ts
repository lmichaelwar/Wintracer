import { GoogleGenAI } from "@google/genai";
import type { Snapshot, ComparisonResult, SnapshotFileCategory } from '../types.ts';
import { SNAPSHOT_CATEGORIES } from '../types.ts';

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
    snapshotB: Snapshot,
    ai: GoogleGenAI
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
    } catch (error: any) {
        console.error(`Error comparing ${category}:`, error);
        // FIX: Removed custom ApiKeyError as API key is handled by environment variables.
        // The error message will be more generic for security.
        return [category, `An error occurred while analyzing the ${SNAPSHOT_CATEGORIES[category]} data. Please check the console for details.`];
    }
}


export async function compareSnapshots(
    snapshotA: Snapshot,
    snapshotB: Snapshot
): Promise<ComparisonResult> {
    // FIX: Initialize GoogleGenAI with API key from environment variables as per guidelines.
    // The API key parameter is removed.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const categoriesToCompare = Object.keys(SNAPSHOT_CATEGORIES) as SnapshotFileCategory[];
    
    const comparisonPromises = categoriesToCompare.map(category => 
        compareCategory(category, snapshotA, snapshotB, ai)
    );

    const results = await Promise.all(comparisonPromises);
    
    return Object.fromEntries(results);
}
