import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

function Roadmap() {
  const { id } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await fetch(`http://localhost:5000/api/roadmaps/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        let flowNodes = [];
        let flowEdges = [];

        if (data.steps) {
          flowNodes = data.steps.map((step, index) => ({
            id: String(index + 1),
            data: { label: step },
            position: { x: (index % 2) * 280, y: Math.floor(index / 2) * 180 },
            style: {
              background: "#1e1e2f",
              color: "#f8f8f2",
              border: "1px solid #3a3a4d",
              padding: 10,
              borderRadius: 8,
              fontSize: 14,
              minWidth: 120,
              maxWidth: 200,
              textAlign: "center",
              wordWrap: "break-word",
            },
          }));

          flowEdges = data.steps.slice(0, -1).map((_, index) => ({
            id: `${index + 1}-${index + 2}`,
            source: String(index + 1),
            target: String(index + 2),
            style: { stroke: "#9f7aea", strokeWidth: 2 },
            animated: true,
          }));
        } else if (data.nodes) {
          flowNodes = data.nodes.map((n, index) => ({
            id: n.id,
            data: { label: n.label },
            position: { x: (index % 2) * 280, y: Math.floor(index / 2) * 180 },
            style: {
              background: "#1e1e2f",
              color: "#f8f8f2",
              border: "1px solid #3a3a4d",
              padding: 10,
              borderRadius: 8,
              fontSize: 14,
              minWidth: 120,
              maxWidth: 200,
              textAlign: "center",
              wordWrap: "break-word",
            },
          }));

          flowEdges = data.nodes.flatMap((n) =>
            n.children.map((childId) => ({
              id: `${n.id}-${childId}`,
              source: n.id,
              target: childId,
              style: { stroke: "#9f7aea", strokeWidth: 2 },
              animated: true,
            }))
          );
        }

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err) {
        console.error("❌ Error fetching roadmap:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRoadmap();
  }, [id]);

  // Auto-fit on load and resize
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: 0.2 });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <p className="p-6 text-gray-300">Loading roadmap...</p>;
  if (error) return <p className="p-6 text-red-400">Error: {error}</p>;

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4">
  <div className="w-full h-[80vh] overflow-auto rounded-lg border border-gray-700">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      onInit={(instance) => {
        reactFlowInstance.current = instance;
        instance.fitView({ padding: 0.2 });
      }}
      style={{ background: "#111827" }}
      panOnScroll={false}       // ❌ disable pan with scroll
      zoomOnScroll={false}      // ❌ disable zoom with scroll
      zoomOnPinch={false}       // ❌ disable pinch zoom
      panOnDrag={false}         // ❌ disable dragging
      nodesDraggable={false}    // ❌ disable dragging nodes
      nodesConnectable={false}  // ❌ disable creating edges
      elementsSelectable={false}
    >
      <Controls style={{ background: "#1f2937", color: "#f8f8f2" }} />
      {/* <Background color="#374151" gap={20} size={1.5} /> */}
    </ReactFlow>
  </div>
</div>

  );
}

export default Roadmap;
