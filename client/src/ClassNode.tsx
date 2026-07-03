import { Handle, Position, type NodeProps } from 'reactflow';

export interface ClassNodeData {
  name: string;
  members: string[];
  stereotype?: string;
  onRename: (id: string) => void;
  onAddMember: (id: string) => void;
  onEditMember: (id: string, idx: number) => void;
  onDeleteMember: (id: string, idx: number) => void;
  onDeleteNode: (id: string) => void;
}

export default function ClassNode({ id, data }: NodeProps<ClassNodeData>) {
  return (
    <div className="class-node">
      <Handle type="target" position={Position.Top} />
      <div className="class-node-header" onDoubleClick={() => data.onRename(id)}>
        {data.stereotype && <div className="class-node-stereotype">«{data.stereotype}»</div>}
        <div className="class-node-title">{data.name}</div>
        <button className="class-node-icon-btn" title="Delete class" onClick={() => data.onDeleteNode(id)}>
          ×
        </button>
      </div>
      <div className="class-node-members">
        {data.members.map((m, idx) => (
          <div key={idx} className="class-node-member" onDoubleClick={() => data.onEditMember(id, idx)}>
            <span>{m}</span>
            <button
              className="class-node-icon-btn"
              title="Delete member"
              onClick={(e) => {
                e.stopPropagation();
                data.onDeleteMember(id, idx);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button className="class-node-add-member" onClick={() => data.onAddMember(id)}>
          + member
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
