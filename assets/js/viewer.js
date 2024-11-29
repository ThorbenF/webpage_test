async function loadPDB() {
    const pdbId = document.getElementById('pdbInput').value.trim().toUpperCase();
    if (!pdbId) {
        alert("Please enter a valid PDB ID.");
        return;
    }

    const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;

    try {
        const response = await fetch(pdbUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDB file for ID: ${pdbId}`);
        }
        const pdbText = await response.text();

        // Initialize the viewer
        const viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });
        viewer.addModel(pdbText, "pdb");
        viewer.setStyle({}, { cartoon: { color: "spectrum" } });
        viewer.zoomTo();
        viewer.render();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
