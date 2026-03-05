import type { VocabularyNode } from '@/types';

type VocabularyTreeProps = {
  nodes: VocabularyNode[];
  unlockedIds: string[];
};

type TreeNode = VocabularyNode & { children: TreeNode[] };

function buildTree(nodes: VocabularyNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }

  return roots;
}

type TreeNodeItemProps = {
  node: TreeNode;
  unlockedIds: string[];
  depth: number;
};

function TreeNodeItem({ node, unlockedIds, depth }: TreeNodeItemProps) {
  const indent = depth * 20;

  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {depth > 0 && <span className="text-slate-300 select-none">└</span>}
        <span className="text-sm font-medium text-indigo-700">{node.word}</span>
        <span className="text-xs text-slate-500">({node.japaneseMeaning})</span>
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              unlockedIds={unlockedIds}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function VocabularyTree({
  nodes,
  unlockedIds,
}: VocabularyTreeProps) {
  const unlockedNodes = nodes.filter((n) => unlockedIds.includes(n.id));
  const roots = buildTree(unlockedNodes);

  if (unlockedNodes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        まだ解放された語彙がありません
      </div>
    );
  }

  const unlockedCount = unlockedIds.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700">語彙地層マップ</h3>
          <span className="text-sm text-slate-500">
            {unlockedCount} / {nodes.length} 語解放済み
          </span>
        </div>
      </div>
      <div className="p-2">
        <ul>
          {roots.map((root) => (
            <TreeNodeItem
              key={root.id}
              node={root}
              unlockedIds={unlockedIds}
              depth={0}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
