import { ethers } from "ethers";
import abi from "./contractABI.json";

const contractAddress = "0xDA85dA0C8e404737420dACeBF23cEf49fd3f928D";

// HTML elemanlarını oluştur
const connectButton = document.createElement("button");
connectButton.textContent = "🔗 Connect Wallet";
document.body.appendChild(connectButton);

const candidatesDiv = document.createElement("div");
document.body.appendChild(candidatesDiv);

let contract: ethers.Contract;

declare global {
  interface Window {
    ethereum?: any;
  }
}

connectButton.onclick = async () => {
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return;
  }

  console.log("Connect Wallet tıklandı");

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  contract = new ethers.Contract(contractAddress, abi, signer);

  const candidates: string[] = await contract.getCandidates();
  candidatesDiv.innerHTML = ""; // Temizle

  for (const name of candidates) {
    const wrapper = document.createElement("div");
    wrapper.className = "candidate";



    const nameEl = document.createElement("strong");
    nameEl.innerText = `🧑 ${name}`;
    wrapper.appendChild(nameEl);

    const voteCountEl = document.createElement("span");
    const votes = await contract.getVotes(name);
    voteCountEl.innerText = ` — ${votes.toString()} votes`;
    wrapper.appendChild(voteCountEl);

    const voteButton = document.createElement("button");
    voteButton.textContent = "🗳 Vote";
    voteButton.onclick = async () => {
      try {
        const tx = await contract.vote(name);
        await tx.wait();
        const updatedVotes = await contract.getVotes(name);
        voteCountEl.innerText = ` — ${updatedVotes.toString()} votes ✅`;
      } catch (err: any) {
        alert("Voting failed: " + (err?.reason || err?.message));
      }
    };

    wrapper.appendChild(voteButton);
    wrapper.style.margin = "1rem 0";

    candidatesDiv.appendChild(wrapper);
  }

  const winnerDiv = document.createElement("div");
winnerDiv.style.marginTop = "2rem";
candidatesDiv.appendChild(winnerDiv);
winnerDiv.id = "winner";

const calculateWinner = async () => {
  const candidates = await contract.getCandidates();
  let winner = "";
  let maxVotes = -1;

  for (const name of candidates) {
    const votes = await contract.getVotes(name);
    const voteCount = Number(votes.toString());

    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      winner = name;
    }
  }

  winnerDiv.innerHTML = `🏆 <strong>Current Winner:</strong> ${winner} (${maxVotes} votes)`;
};

// Sayfa yüklenince ve her oy sonrası çağır:
await calculateWinner();

};
