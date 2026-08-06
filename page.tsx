"use client";

import { useMemo, useState } from "react";

type Asset = {
  name: string;
  address: string;
  owner: string;
  type: string;
  documents: number;
  status: string;
  note: string;
};

const assets: Asset[] = [
  {
    name: "Bob Wallace Building",
    address: "3000 & 3002 Bob Wallace Ave., Huntsville, Alabama",
    owner: "BAA Investments LLC",
    type: "Commercial rental",
    documents: 1,
    status: "Active",
    note: "Sales contract and roof-related records",
  },
  {
    name: "Morris Pond Property",
    address: "Morris Pond Road, Gulfport, Mississippi",
    owner: "Wheeler Land Holdings LLC",
    type: "Vacant land",
    documents: 1,
    status: "Under review",
    note: "Purchase proposal and land records",
  },
  {
    name: "Midpointe Chevron",
    address: "24999 Highway 72, Athens, Alabama",
    owner: "Jay Daradti",
    type: "Convenience store",
    documents: 0,
    status: "Active",
    note: "Ready for documents, insurance, and reminders",
  },
];

const reminders = [
  { title: "Review Morris Pond proposal", date: "Aug 12", asset: "Morris Pond Property" },
  { title: "Add Bob Wallace insurance records", date: "Aug 15", asset: "Bob Wallace Building" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) =>
      [asset.name, asset.address, asset.owner, asset.type].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [query]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  }

  return (
    <main className="appShell">
      {notice ? <div className="toast">{notice}</div> : null}

      <header className="topbar">
        <div className="brandGroup">
          <div className="brandMark">M</div>
          <div>
            <h1>MyBigVault</h1>
            <p>Private asset management</p>
          </div>
        </div>
        <button className="avatar" aria-label="Account menu" onClick={() => showNotice("Account settings will be connected next.")}>BW</button>
      </header>

      <nav className="navTabs" aria-label="Main navigation">
        {["Dashboard", "Assets", "Documents", "Reminders", "Companies"].map((tab) => (
          <button
            className={activeTab === tab ? "navTab active" : "navTab"}
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== "Dashboard" && tab !== "Assets") showNotice(`${tab} is included in the next connection step.`);
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="hero">
        <div>
          <span className="eyebrow">WELCOME BACK, BEN</span>
          <h2>Your assets, documents, and deadlines—together in one place.</h2>
          <p>Version 1 is ready with your starting properties and a mobile-friendly dashboard.</p>
        </div>
        <div className="heroActions">
          <button className="primary" onClick={() => showNotice("The add-asset form will connect to Supabase next.")}>+ Add asset</button>
          <button className="ghost" onClick={() => showNotice("Document upload will connect to secure storage next.")}>Upload document</button>
        </div>
      </section>

      <section className="stats" aria-label="Vault summary">
        <article><span className="statIcon">⌂</span><div><strong>3</strong><span>Assets</span></div></article>
        <article><span className="statIcon">▤</span><div><strong>2</strong><span>Documents</span></div></article>
        <article><span className="statIcon">◷</span><div><strong>2</strong><span>Open reminders</span></div></article>
        <article><span className="statIcon">◉</span><div><strong>2</strong><span>Companies</span></div></article>
      </section>

      <section className="contentGrid">
        <div className="mainColumn">
          <div className="sectionHeader">
            <div>
              <h3>{activeTab === "Assets" ? "All assets" : "Your assets"}</h3>
              <p>Search by name, address, company, or asset type.</p>
            </div>
            <label className="searchBox">
              <span>⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your vault" />
            </label>
          </div>

          <section className="assetGrid">
            {filteredAssets.map((asset) => (
              <article className="assetCard" key={asset.name}>
                <div className="cardTop">
                  <div className="assetIcon">⌂</div>
                  <span className={asset.status === "Active" ? "status activeStatus" : "status"}>{asset.status}</span>
                </div>
                <p className="assetType">{asset.type}</p>
                <h4>{asset.name}</h4>
                <p className="address">{asset.address}</p>
                <dl>
                  <div><dt>Owner</dt><dd>{asset.owner}</dd></div>
                  <div><dt>Documents</dt><dd>{asset.documents}</dd></div>
                </dl>
                <p className="cardNote">{asset.note}</p>
                <button className="openButton" onClick={() => showNotice(`${asset.name} detail page is prepared for the database connection.`)}>Open asset <span>→</span></button>
              </article>
            ))}
          </section>
          {filteredAssets.length === 0 ? <div className="emptyState">No assets match “{query}”.</div> : null}
        </div>

        <aside className="sideColumn">
          <section className="panel">
            <div className="panelHeader"><div><span className="miniEyebrow">UPCOMING</span><h3>Reminders</h3></div><button onClick={() => showNotice("Reminder creation will connect next.")}>+</button></div>
            <div className="reminderList">
              {reminders.map((reminder) => (
                <article key={reminder.title}>
                  <div className="dateBadge"><strong>{reminder.date.split(" ")[1]}</strong><span>{reminder.date.split(" ")[0]}</span></div>
                  <div><h4>{reminder.title}</h4><p>{reminder.asset}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="aiPanel">
            <div className="spark">✦</div>
            <span className="miniEyebrow">AI DOCUMENT ASSISTANT</span>
            <h3>File documents automatically</h3>
            <p>MyBigVault will read a contract, policy, deed, or invoice and suggest the correct asset.</p>
            <button onClick={() => showNotice("AI filing comes after secure document upload is connected.")}>See how it will work</button>
          </section>

          <section className="panel companyPanel">
            <span className="miniEyebrow">OWNERSHIP</span>
            <h3>Companies</h3>
            <div className="companyRow"><span>BAA</span><div><strong>BAA Investments LLC</strong><small>1 asset</small></div></div>
            <div className="companyRow"><span>WL</span><div><strong>Wheeler Land Holdings LLC</strong><small>1 asset</small></div></div>
          </section>
        </aside>
      </section>

      <footer>MyBigVault private prototype • Version 0.2</footer>
    </main>
  );
}
