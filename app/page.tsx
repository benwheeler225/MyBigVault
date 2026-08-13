"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  created_at: string;
  owner_id: string;
  name: string;
  address: string | null;
  owner_entity: string | null;
  asset_type: string | null;
  notes: string | null;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEntity, setOwnerEntity] = useState("");
  const [assetType, setAssetType] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initializeAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthLoading(false);
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadProperties(user.id);
    } else {
      setProperties([]);
    }
  }, [user]);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setAuthMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthMessage(`Login failed: ${error.message}`);
      setLoading(false);
      return;
    }

    setUser(data.user);
    setEmail("");
    setPassword("");
    setAuthMessage("");
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
    setProperties([]);
    setMessage("");
    clearForm();
  }

  async function loadProperties(ownerId: string) {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(`Error loading properties: ${error.message}`);
      return;
    }

    setProperties(data ?? []);
  }

  function clearForm() {
    setName("");
    setAddress("");
    setOwnerEntity("");
    setAssetType("");
    setNotes("");
    setEditingId(null);
  }

  async function addProperty(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) {
      setMessage("You must be logged in.");
      return;
    }

    if (!name.trim()) {
      setMessage("Please enter a property name.");
      return;
    }

    setLoading(true);
    setMessage("");

    if (editingId) {
      const { error } = await supabase
        .from("properties")
        .update({
          name: name.trim(),
          address: address.trim() || null,
          owner_entity: ownerEntity.trim() || null,
          asset_type: assetType.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("id", editingId)
        .eq("owner_id", user.id);

      if (error) {
        console.error(error);
        setMessage(`Error updating property: ${error.message}`);
        setLoading(false);
        return;
      }

      setMessage("Property updated successfully.");
    } else {
      const { error } = await supabase.from("properties").insert([
        {
          owner_id: user.id,
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

      setMessage("Property added successfully.");
    }

    clearForm();
    await loadProperties(user.id);

    setLoading(false);
  }

  function editProperty(property: Property) {
    setEditingId(property.id);
    setName(property.name);
    setAddress(property.address ?? "");
    setOwnerEntity(property.owner_entity ?? "");
    setAssetType(property.asset_type ?? "");
    setNotes(property.notes ?? "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    clearForm();
    setMessage("Edit cancelled.");
  }

  if (authLoading) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "60px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>MyBigVault</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "60px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "8px",
          }}
        >
          MyBigVault
        </h1>

        <p
          style={{
            color: "#555",
            marginBottom: "30px",
          }}
        >
          Sign in to access your private property vault.
        </p>

        <form onSubmit={signIn}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "5px",
              }}
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "5px",
              }}
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 22px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {authMessage && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
            }}
          >
            {authMessage}
          </p>
        )}
      </main>
    );
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "36px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            MyBigVault
          </h1>

          <p
            style={{
              margin: 0,
              color: "#555",
            }}
          >
            Your private property and asset vault.
          </p>
        </div>

        <button
          onClick={signOut}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "35px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingId ? "Edit Property" : "Add Property"}
        </h2>

        <form onSubmit={addProperty}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="property-name"
              style={{
                display: "block",
                marginBottom: "5px",
              }}
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
              style={{
                display: "block",
                marginBottom: "5px",
              }}
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
              style={{
                display: "block",
                marginBottom: "5px",
              }}
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
              style={{
                display: "block",
                marginBottom: "5px",
              }}
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
              style={{
                display: "block",
                marginBottom: "5px",
              }}
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

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Save Changes"
                : "Add Property"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "12px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "bold",
            }}
          >
            {message}
          </p>
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

              <button
                type="button"
                onClick={() => editProperty(property)}
                style={{
                  padding: "9px 16px",
                  cursor: "pointer",
                  marginTop: "5px",
                }}
              >
                Edit Property
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
