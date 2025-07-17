/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react";

// TreeNode component renders a single node in the tree
const TreeNode = ({ node, level = 0, isCollapsed }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="tree-node">
      <div 
        className={`node-content flex items-center py-1 px-1 hover:bg-gray-100 rounded-md cursor-pointer ${isCollapsed ? "" : "ml-" + level}`}
        onClick={hasChildren ? toggleExpand : undefined}
      >
        <span className="flex items-center truncate w-full">
          {hasChildren ? (
            <span className="text-gray-500 flex-shrink-0">
              {expanded ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </span>
          ) : (
            <span className="w-4 h-4 flex-shrink-0"></span>
          )}
          
          <span className="text-gray-600 mx-1 flex-shrink-0">
            {hasChildren ? (
              expanded ? 
                <FolderOpen size={16} className="text-blue-500" /> : 
                <Folder size={16} className="text-amber-500" />
            ) : (
              <File size={16} className="text-gray-400" />
            )}
          </span>
          
          {!isCollapsed && (
            <Link 
              to={node.path} 
              className="node-link text-gray-700 hover:text-blue-600 font-medium text-sm truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {node.name}
            </Link>
          )}
          
          {isCollapsed && (
            <div className="relative group">
              <div className="
                invisible group-hover:visible
                absolute left-full top-0
                px-2 py-1 ml-2
                bg-gray-800 text-white text-xs rounded
                whitespace-nowrap opacity-0 group-hover:opacity-100
                transition-all duration-150
                shadow-lg pointer-events-none z-50
              ">
                {node.name}
                <div className="
                  absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
                  w-2 h-2 bg-gray-800 rotate-45
                " />
              </div>
            </div>
          )}
        </span>
      </div>
      
      {hasChildren && expanded && (
        <div className={`children ${isCollapsed ? "pl-1" : "pl-2"} ${level > 0 && !isCollapsed ? "ml-4 border-l border-gray-100" : ""}`}>
          {node.children.map((child, index) => (
            <TreeNode 
              key={`${child.name}-${index}`} 
              node={child} 
              level={level + 1}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// TreeView component renders the entire tree structure
export const FolderTreeNav = ({ structure, isCollapsed = false }) => {
  return (
    <div className={`tree-view overflow-y-auto overflow-x-hidden ${isCollapsed ? "p-1 w-16" : "p-2 w-64"} h-[calc(100vh-4rem)]`}>
      <TreeNode node={structure} isCollapsed={isCollapsed} />
    </div>
  );
};

export default FolderTreeNav;