"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Property = {
  id: string;
  owner_id: string;
  name: string;
  address: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
      await loadProperties(user.id);
    }

    setLoading(false);
  }

  async function login() {
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      setUserId(data.user.id);
      setEmail("");
      setPassword("");
      setMessage("Logged in successfully.");
      await loadProperties(data.user.id);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUserId(null);
    setProperties([]);
    setMessage("Logged out.");
  }

  async function loadProperties(currentUserId: string) {
    const { data, error } = await supabase
      .from("properties")
      .select("id, owner_id, name, address")
      .eq("owner_id", currentUserId)
      .order("name");

    if (error) {
      setMessage(error.message);
      return;
    }

    setProperties(data ?? []);
  }

  async function addProperty() {
    if (!userId) return;

    if (!name.trim()) {
      setMessage("Please enter a property name.");
      return;
    }

    setMessage("");

    const { error } = await supabase.from("properties").insert({
      owner_id: userId,
      name: name.trim(),
      address: address.trim(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setName("");
    setAddress("");
    setMessage("Property added successfully.");

    await loadProperties(userId);
  }

  if (loading) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <h1>MyBigVault</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "60px auto",
          padding: "30px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>MyBigVault</h1>
        <h2>Login</h2>

        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={login}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

        {message && <p>{message}</p>}
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>MyBigVault</h1>
          <p>Your private asset vault</p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "8px 15px",
            cursor: "pointer",
          }}
        >
          Log Out
        </button>
      </div>

      <hr />

      <section style={{ marginTop: "30px" }}>
        <h2>Add Property</h2>

        <div style={{ marginBottom: "12px" }}>
          <label>Property Name</label>
          <br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Bob Wallace Building"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Address</label>
          <br />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Example: 3000 Bob Wallace Ave"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={addProperty}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Add Property
        </button>
      </section>

      {message && (
        <p
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f3f3f3",
          }}
        >
          {message}
        </p>
      )}

      <section style={{ marginTop: "40px" }}>
        <h2>My Properties</h2>

        {properties.length === 0 ? (
          <p>No properties have been added yet.</p>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "18px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{property.name}</h3>
              <p>{property.address || "No address entered"}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
