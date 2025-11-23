const defaultWords = ["Bahebk", "b3sha2ak", "bamout feek"];
const placeholderCount = 3;
const treeGrid = document.getElementById("love-tree-grid");
const wordForm = document.getElementById("word-form");
const wordInput = document.getElementById("new-word-input");
const formStatus = document.getElementById("form-status");

function createNode(word, className = "") {
  const div = document.createElement("div");
  div.className = `tree-node ${className}`.trim();
  div.textContent = word;
  return div;
}

function renderBaseTree() {
  if (!treeGrid) return;
  defaultWords.forEach((word) => treeGrid.appendChild(createNode(word)));
  for (let i = 0; i < placeholderCount; i++) {
    treeGrid.appendChild(createNode("Future word", "placeholder"));
  }
}

function addWordToTree(word) {
  if (!treeGrid) return;
  const newNode = createNode(word, "user-word");
  treeGrid.appendChild(newNode);
}

function updateStatus(message, success = true) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.style.color = success ? "#8a0e54" : "#c21872";
}

// ===== Firebase setup =====
let firestore;
let firebaseReady = false;

async function initFirebase() {
  try {
    const [{ initializeApp }, { getFirestore }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"),
    ]);

    const firebaseConfig =
      window.FIREBASE_LOVE_CONFIG ||
      window.firebaseConfig || {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID",
      };

    const app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    firebaseReady = true;
    updateStatus("Connected. Add the next word!");
    await loadExistingWords();
  } catch (error) {
    firebaseReady = false;
    updateStatus(
      "Couldn't reach Firebase yet. New words will still appear here.",
      false
    );
    console.warn("Firebase setup issue", error);
  }
}

async function loadExistingWords() {
  if (!firebaseReady || !firestore) {
    updateStatus("Added locally, but waiting for Firebase connection.", false);
    return false;
  }
  try {
    const { collection, getDocs, orderBy, query } = await import(
      "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"
    );
    const wordsQuery = query(
      collection(firestore, "loveWords"),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(wordsQuery);
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.text) {
        addWordToTree(data.text);
      }
    });
  } catch (error) {
    updateStatus("Couldn't load saved words yet, but you can keep adding.", false);
    console.warn("Load words failed", error);
  }
}

async function saveWord(word) {
  if (!firebaseReady || !firestore) return;
  try {
    const { collection, addDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js"
    );
    await addDoc(collection(firestore, "loveWords"), {
      text: word,
      createdAt: serverTimestamp(),
    });
    updateStatus("Saved to Firebase and added to our tree!");
        return true;

  } catch (error) {
    updateStatus("Added locally, but couldn't save to Firebase yet.", false);
    console.warn("Save word failed", error);
        return false;

  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  if (!wordInput) return;
  const word = wordInput.value.trim();
  if (!word) return;
  addWordToTree(word);
 updateStatus("Saving to Firebase...");

  if (firebaseSetupPromise) {
    await firebaseSetupPromise;
  }

  await saveWord(word);  wordInput.value = "";
}

renderBaseTree();
const firebaseSetupPromise = initFirebase();

if (wordForm) {
  wordForm.addEventListener("submit", handleFormSubmit);
}
