import { useState, useEffect } from "react";
import { generateCoverLetter } from "../utils/api";
import jsPDF from "jspdf";

import { useRef } from "react";


export default function Popup() {
  const letterRef = useRef(null);

  const [jd, setJD] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [letter, setLetter] = useState("");
  const [generating, setGenerating] = useState(false);
  const [manualJD, setManualJD] = useState(false);
  const [company, setCompany] = useState("");
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState("Professional");
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);








  const [profile, setProfile] = useState({
  name: "",
  role: "",
  skills: "",
  experience: "",
  email: "",
  phone: ""
});

  
 useEffect(() => {
  if (chrome?.storage?.sync) {
    chrome.storage.sync.get(["profile"], (result) => {
      if (result.profile) {
        setProfile(result.profile);
      }
    });
  }
}, []);

useEffect(() => {
   if (chrome?.storage?.sync) {
  chrome.storage.sync.get(["profile", "company"], (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.company) setCompany(result.company);
  });
}
}, []);

useEffect(() => {
  if (chrome?.storage?.sync) {
  chrome.storage.sync.get(["profile", "company"], (result) => {
    if (result.profile) setProfile(result.profile);
    if (result.company) setCompany(result.company);
  });
}
if (chrome?.storage?.sync) {

  chrome.storage.local.get(["letterHistory"], (result) => {
    if (result.letterHistory) {
      setHistory(result.letterHistory);
    }
  });
}
}, []);





  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...profile, [name]: value };
    setProfile(updated);
    if (chrome?.storage?.sync) {
      chrome.storage.sync.set({ profile: updated });
    }

  };



  
 const handleExtractJD = () => {
  setLoading(true);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "extractJD" }, (response) => {
      const extractedJD = response?.jobDescription || "Could not extract job description.";
      setJD(extractedJD);
      setLoading(false);

      
      const match = extractedJD.match(/(?:Company Name[:\-]\s*)([A-Za-z0-9 &]+)/i)
                    || extractedJD.match(/([A-Z][a-zA-Z0-9& ]+)\s+is\s+hiring/i);
      if (match) {
        setCompany(match[1]);
      }
    });
  });
};


  const handleGenerate = async () => {
  if (!jd || !profile.name || !profile.role) {
    alert("Please fill profile and extract JD first.");
    return;
  }
  setGenerating(true);
  const result = await generateCoverLetter(profile, jd, company, tone);


   const cleanLetter = result.replace(/\[.*?\]/g, "").trim();
  setLetter(cleanLetter);
  const newEntry = {
  letter: result,
  company,
  role: profile.role,
  tone,
  timestamp: new Date().toLocaleString()
};

const updatedHistory = [newEntry, ...history.slice(0, 9)]; 
setHistory(updatedHistory);
chrome.storage.local.set({ letterHistory: updatedHistory });
  setGenerating(false);
};

const handleRegenerate = async () => {
  if (!jd || !profile.name || !profile.role) {
    alert("Please fill profile and extract JD first.");
    return;
  }
  setGenerating(true);
  const result = await generateCoverLetter(profile, jd, company, tone);
  
  const cleanLetter = result.replace(/\[.*?\]/g, "").trim();
  setLetter(cleanLetter);
  const newEntry = {
  letter: result,
  company,
  role: profile.role,
  tone,
  timestamp: new Date().toLocaleString()
};

const updatedHistory = [newEntry, ...history.slice(0, 9)]; // max 10 letters
setHistory(updatedHistory);
chrome.storage.local.set({ letterHistory: updatedHistory });
  setGenerating(false);
};


const handleDownloadPDF = () => {
  const doc = new jsPDF();

  const today = new Date().toLocaleDateString();

  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(profile.name, 10, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(profile.role, 10, 27);
  doc.text("Date: " + today, 10, 34);

  
  doc.text(`\nHiring Manager`, 10, 44);
  if (company) doc.text(`${company}`, 10, 51);

  
  doc.setFont("helvetica", "bold");
  doc.text("\nSubject: Application for " + profile.role + " Position", 10, 61);
  doc.setFont("helvetica", "normal");

  
  const lines = doc.splitTextToSize(letter, 180); 
  doc.text(lines, 10, 75);

  
  const closingY = 75 + lines.length * 6;
  doc.text("\n\nSincerely,", 10, closingY);
  doc.text(profile.name, 10, closingY + 6);

  
  const safeName = profile.role.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`Cover_Letter_${safeName}.pdf`);
};





  return (
    <div className="min-w-[380px] max-h-[600px] overflow-auto p-4 bg-white text-black text-sm">
      <h1 className="text-xl font-bold text-blue-600 mb-2">CoverGenie AI</h1>

      <div className="space-y-2 mb-3">
        <input
          name="name"
          value={profile.name}
          onChange={handleProfileChange}
          placeholder="Full Name"
          className="w-full p-1 border rounded"
        />
        <input
          name="role"
          value={profile.role}
          onChange={handleProfileChange}
          placeholder="Job Role"
          className="w-full p-1 border rounded"
        />
        <input
          name="email"
          value={profile.email}
          onChange={handleProfileChange}
          placeholder="Email"
          className="w-full p-1 border rounded"
        />
        {/* <input
          name="phone"
          value={profile.phone}
          onChange={handleProfileChange}
          placeholder="Phone Number"
          className="w-full p-1 border rounded"
        /> */}

        <input
          name="skills"
          value={profile.skills}
          onChange={handleProfileChange}
          placeholder="Skills (comma-separated)"
          className="w-full p-1 border rounded"
        />
        <textarea
          cols={6}
          name="experience"
          value={profile.experience}
          onChange={handleProfileChange}
          placeholder="Experience Summary"
          className="w-full p-1 border rounded"
        />
      </div>

      {/* <input
        name="company"
        value={company}
        onChange={(e) => {
          setCompany(e.target.value);
          chrome?.storage?.sync?.set({ company: e.target.value });
        }}
        placeholder="Company Name"
        className="w-full p-1 border rounded mb-3"
      /> */}


      {!jd && !manualJD && (
        <button
          onClick={handleExtractJD}
          className="bg-blue-600 text-white px-3 py-1 rounded mb-2"
        >
          {loading ? "Extracting..." : "Extract Job Description"}
        </button>
      )}


        {manualJD ? (
        <div className="mt-2">
          <textarea
            placeholder="Paste Job Description manually..."
            className="w-full p-2 border rounded text-xs h-28"
            value={jd}
            onChange={(e) => setJD(e.target.value)}
          />
        </div>
      ) : jd  && (
        <div className="mt-2 border p-2 rounded text-xs max-h-[150px] overflow-auto">
          <strong>Extracted JD:</strong>
          <p className="mt-1 whitespace-pre-wrap text-left">
            {expanded ? jd : `${jd.slice(0, 400)}...`}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-500 mt-1 underline"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        </div>
      ) }

      {jd.includes("Could not extract job description") || jd.includes("Unsupported site. Currently supports LinkedIn, Naukri, Indeed") ? (

        <button
          onClick={() => setManualJD(true)}
          className="text-blue-500 underline mb-2"
        >
          JD not found? Enter manually
        </button>
      )
      :
      ""}






      <div className="mb-2">
        <label className="block font-medium text-sm mb-1">Tone:</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full border p-1 rounded"
        >
          <option>Professional</option>
          <option>Friendly</option>
          <option>Enthusiastic</option>
          <option>Concise</option>
        </select>
      </div>


       {jd && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleGenerate}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              {generating ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={handleRegenerate}
              className="bg-yellow-600 text-white px-3 py-1 rounded"
            >
              🔁 Regenerate
            </button>
          </div>
        )}



      {letter && (
          <>
            <div
              ref={letterRef}
              className="mt-2 border p-2 rounded text-xs max-h-[250px] overflow-auto bg-gray-50"
            >
              <strong>AI Cover Letter:</strong>
              {isEditing ? (
                <textarea
                  className="w-full p-2 border rounded text-xs h-40 mt-1"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-left">{letter}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(letter);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`px-3 py-1 rounded text-xs ${
                  copied ? "bg-green-600" : "bg-gray-800"
                } text-white`}
              >
                {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
              </button>

              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1 bg-blue-700 text-white rounded text-xs"
              >
                📄 Download PDF
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
              >
                {isEditing ? "✅ Done Editing" : "✏️ Edit Letter"}
              </button>
            </div>
          </>
        )}

     {history.length > 0 && (
  <div className="mt-4">
    <h2 className="font-semibold text-sm mb-1">📜 Saved Letters</h2>

    <div className="space-y-2 max-h-[200px] overflow-auto">
      {history.map((entry, index) => (
        <div key={index} className="border p-2 rounded bg-gray-50 text-xs">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[10px] text-gray-500">
              {entry.timestamp} • {entry.tone} • {entry.company}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => navigator.clipboard.writeText(entry.letter)}
                className="text-blue-500 text-[10px]"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const doc = new jsPDF();
                  const lines = doc.splitTextToSize(entry.letter, 180);
                  doc.setFontSize(12);
                  doc.text(lines, 10, 20);
                  doc.save(`Cover_Letter_${entry.role}_${entry.company}.pdf`);
                }}
                className="text-blue-500 text-[10px]"
              >
                📄 PDF
              </button>
            </div>
          </div>
          <p className="whitespace-pre-wrap">{entry.letter.slice(0, 300)}...</p>
        </div>
      ))}
    </div>

    
    <button
      onClick={() => {
        chrome.storage.local.remove("letterHistory");
        setHistory([]);
      }}
      className="text-red-600 text-xs underline mt-2"
    >
      🗑️ Clear All Saved Letters
    </button>
  </div>
)}





    </div>
  );
}
