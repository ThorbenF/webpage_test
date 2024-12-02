async function loadStructure() {
    const pdbId = document.getElementById('pdbInput').value.trim().toUpperCase();
    const sequence = document.getElementById('sequenceInput').value.trim().toUpperCase(); // Get sequence input dynamically
    if (!pdbId || !sequence) {
        return; // Do nothing if input is empty
    }

    // Try to load the PDB file first
    const pdbUrl = `https://files.rcsb.org/download/${pdbId}.pdb`;
    let structureUrl = pdbUrl;
    let fileType = "pdb";

    // First attempt: Try to fetch the PDB file
    let response = await fetch(pdbUrl);
    if (!response.ok) {
        // If PDB file is not available, switch to CIF file
        const cifUrl = `https://files.rcsb.org/download/${pdbId}.cif`;
        response = await fetch(cifUrl); // Try CIF file
        if (!response.ok) return; // Exit if CIF file also fails
        fileType = "mmcif"; // Set to mmCIF if CIF file is used
    }

    // Once a valid response is obtained, process the structure (PDB or CIF)
    const structureText = await response.text();

    // Initialize the viewer
    const viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });
    viewer.addModel(structureText, fileType); // Load as pdb or mmCIF based on the file
    viewer.setStyle({}, { cartoon: { color: "spectrum" } });
    viewer.zoomTo();
    viewer.render();

    // Show loading message while waiting for scores
    const scoresContainer = document.getElementById('scoresContainer');
    scoresContainer.innerHTML = "<p>Loading scores, please wait...</p>";

    // Now fetch the scores from Hugging Face
    const modelUrl = "https://huggingface.co/spaces/ThorbenF/test_webpage/api/predict";  // Hugging Face Space API endpoint

    try {
        const response = await fetch(modelUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: sequence,  // Send the sequence to the model
            }),
        });

        // Parse the JSON response from the Hugging Face Space
        const data = await response.json();
        const scores = data?.predictions;  // Assuming predictions are in this field, adjust accordingly
        
        if (scores) {
            displayScores(scores);  // Function to display scores
        } else {
            console.error("No scores returned from Hugging Face");
            scoresContainer.innerHTML = "<p>Error fetching scores</p>";
        }
    } catch (error) {
        console.error("Error fetching scores from Hugging Face:", error);
        scoresContainer.innerHTML = "<p>Error fetching scores</p>";
    }
}

// Function to display the scores
function displayScores(scores) {
    const scoresContainer = document.getElementById('scoresContainer');  // Make sure you have an element to display scores
    scoresContainer.innerHTML = "";  // Clear previous scores

    // Display scores for each residue
    scores.forEach((score, index) => {
        const aminoAcid = "A";  // Here we are assuming the sequence is 'A' for each residue
        const scoreText = document.createElement('p');
        scoreText.textContent = `${aminoAcid} (Position ${index + 1}): ${score.toFixed(2)}`;
        scoresContainer.appendChild(scoreText);
    });
}
