import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

const RoadmapFlow = ({ tasks = [], roadmap }) => {
  const reactFlowInstance = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      // Check if mobile (width < 768px)
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { nodes, edges } = useMemo(() => {
    if (!tasks.length) return { nodes: [], edges: [] };

    // Sort tasks by order
    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Distribute tasks into 2 columns on mobile, 3 on desktop
    const totalColumns = isMobile ? 2 : 3;
    const tasksPerColumn = Math.ceil(sortedTasks.length / totalColumns);
    const columnSpacing = containerWidth / (totalColumns + 1);

    const builtNodes = [];
    const builtEdges = [];

    // Create columns
    for (let col = 0; col < totalColumns; col++) {
      const startIdx = col * tasksPerColumn;
      const endIdx = Math.min(startIdx + tasksPerColumn, sortedTasks.length);
      const columnTasks = sortedTasks.slice(startIdx, endIdx);

      columnTasks.forEach((task, idx) => {
        const id = task.taskId || task.id || `col${col}-${idx}`;
        const nodeWidth = Math.min(200, containerWidth / (totalColumns + 1) - 20);
        
        // Color based on difficulty or category
        const getNodeColor = () => {
          if (task.difficulty === 'Advanced') return '#7C3AED';
          if (task.difficulty === 'Intermediate') return '#2563EB';
          return '#059669';
        };

        builtNodes.push({
          id,
          position: {
            x: columnSpacing * (col + 1) - nodeWidth / 2,
            y: idx * 120 + 20,
          },
          data: { label: task.name },
          style: {
            background: getNodeColor(),
            color: '#f9fafb',
            border: '1px solid #4B5563',
            fontSize: 11,
            fontWeight: 500,
            padding: 10,
            width: nodeWidth,
            borderRadius: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
          }
        });

        // Connect to previous task in same column
        if (idx > 0) {
          const prevId = columnTasks[idx - 1].taskId || columnTasks[idx - 1].id || `col${col}-${idx-1}`;
          builtEdges.push({
            id: `${id}-from-${prevId}`,
            source: prevId,
            target: id,
            animated: true,
            style: { stroke: '#6B7280', strokeWidth: 1.5 },
          });
        }

        // Connect last task of previous column to first task of current column
        if (col > 0 && idx === 0 && startIdx > 0) {
          const prevColLastTask = sortedTasks[startIdx - 1];
          const prevId = prevColLastTask.taskId || prevColLastTask.id || `col${col-1}-${tasksPerColumn-1}`;
          builtEdges.push({
            id: `${id}-from-${prevId}-cross`,
            source: prevId,
            target: id,
            animated: true,
            style: { stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '5,5' },
          });
        }
      });
    }

    return { nodes: builtNodes, edges: builtEdges };
  }, [tasks, containerWidth, isMobile]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[400px] h-[60vh] bg-gray-900 rounded-xl border border-gray-700 p-2 md:p-4"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          setTimeout(() => {
            instance.fitView({ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 });
          }, 100);
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
