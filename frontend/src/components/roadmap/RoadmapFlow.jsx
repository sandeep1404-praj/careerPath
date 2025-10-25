import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const RoadmapFlow = ({ tasks = [], roadmap }) => {
  const reactFlowInstance = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!tasks.length) return { nodes: [], edges: [] };

    const statusOrder = { 'not-started': 0, 'in-progress': 1, 'completed': 2 };
    const grouped = tasks.reduce((acc, t) => {
      const key = t.status || 'not-started';
      acc[key] = acc[key] || [];
      acc[key].push(t);
      return acc;
    }, {});

    Object.values(grouped).forEach(arr => arr.sort((a,b) => (a.order||0)-(b.order||0)));

    const totalColumns = Object.keys(statusOrder).length;
    const columnSpacing = containerWidth / (totalColumns + 1); // responsive spacing

    const builtNodes = [];
    const builtEdges = [];

    Object.keys(statusOrder).forEach(status => {
      const colTasks = grouped[status] || [];
      colTasks.forEach((task, idx) => {
        const id = task.taskId || task.id || `${status}-${idx}`;
        const nodeWidth = Math.min(180, containerWidth / (totalColumns + 1));
        builtNodes.push({
          id,
          position: {
            x: columnSpacing * (statusOrder[status] + 0.5),
            y: idx * 100,
          },
          data: { label: task.name },
          style: {
            background: status === 'completed' ? '#047857' 
                        : status === 'in-progress' ? '#B45309' 
                        : '#1F2937',
            color: '#f9fafb',
            border: '1px solid #4B5563',
            fontSize: 12,
            fontWeight: 500,
            padding: 8,
            width: nodeWidth,
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }
        });

        if (idx > 0) {
          const prev = colTasks[idx - 1];
          builtEdges.push({
            id: `${id}-from-${prev.taskId || prev.id}`,
            source: prev.taskId || prev.id || `${status}-${idx-1}`,
            target: id,
            animated: true,
            style: { stroke: '#6B7280', strokeWidth: 1.5 },
          });
        }
      });
    });

    return { nodes: builtNodes, edges: builtEdges };
  }, [tasks, containerWidth]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[400px] h-[60vh] bg-gray-900 rounded-xl border border-gray-700 p-2 md:p-4"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          instance.fitView({ padding: 0.1 });
        }}
        style={{ background: '#111827', borderRadius: '12px' }}
      >
        <Controls style={{ background: '#1F2937', color: '#f8f8f2', borderRadius: '6px' }} />
        <Background color="#374151" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
};

export default RoadmapFlow;
