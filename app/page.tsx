"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  name: string;
  address: string | null;
  owner_entity: string | null;
  asset_type: string | null;
  notes: string | null;
  created_at: string;
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEntity, setOwnerEntity] = useState("");
  const [assetType, setAssetType] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Error loading properties.");
      return;
    }

    setProperties(data ?? []);
  }

  useEffect(() => {
    loadProperties();
  }, []);

  async function addProperty(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a property name.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("properties").insert([
      {
        name: name.trim(),
        address: address.trim() || null,
        owner_entity: ownerEntity.trim() || null,
        asset_type: assetType.trim() || null,
        notes: notes.trim() || null,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage(`Error adding property: ${error.message}`);
      setLoading(false);
      return;
    }

    setName("");
    setAddress("");
    setOwnerEntity("");
    setAssetType("");
    setNotes("");

    setMessage("Property added successfully.");
    await loadProperties();

    setLoading(false);
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>
        MyBigVault
      </h1>

      <p style={{ marginBottom: "30px", color: "#555" }}>
        Your private property and asset vault.
      </p>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "35px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add Property</h2>

        <form onSubmit={addProperty}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="property-name"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Property Name *
            </label>

            <input
              id="property-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Bob Wallace Building"
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="address"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Address
            </label>

            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Property address"
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="owner-entity"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Ownership Entity
            </label>

            <input
              id="owner-entity"
              type="text"
              value={ownerEntity}
              onChange={(e) => setOwnerEntity(e.target.value)}
              placeholder="Example: BAA Investments LLC"
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="asset-type"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Asset Type
            </label>

            <input
              id="asset-type"
              type="text"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              placeholder="Example: Commercial Rental"
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="notes"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 20px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Adding..." : "Add Property"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>
        )}
      </section>

      <section>
        <h2>My Properties</h2>

        {properties.length === 0 ? (
          <p>No properties have been added yet.</p>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "18px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{property.name}</h3>

              {property.address && (
                <p>
                  <strong>Address:</strong> {property.address}
                </p>
              )}

              {property.owner_entity && (
                <p>
                  <strong>Ownership Entity:</strong>{" "}
                  {property.owner_entity}
                </p>
              )}

              {property.asset_type && (
                <p>
                  <strong>Asset Type:</strong> {property.asset_type}
                </p>
              )}

              {property.notes && (
                <p>
                  <strong>Notes:</strong> {property.notes}
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
