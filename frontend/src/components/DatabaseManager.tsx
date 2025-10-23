"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Database, Edit, Trash2, Save, X, Plus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://marketplace-wtvs.onrender.com";

type TableName = "podcasts" | "emails" | "papers" | "paper-requests";

interface TableData {
  items: any[];
  count: number;
}

export function DatabaseManager() {
  const [activeTable, setActiveTable] = useState<TableName>("podcasts");
  const [tableData, setTableData] = useState<TableData>({ items: [], count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    loadTableData();
  }, [activeTable]);

  const loadTableData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/database/${activeTable}?limit=200`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error loading table data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
      const primaryKey = getPrimaryKey(activeTable);
      const endpoint = `${API_URL}/api/admin/database/${activeTable}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [primaryKey]: editForm[primaryKey],
          updates: editForm
        })
      });

      if (response.ok) {
        toast.success("Updated successfully");
        setEditingItem(null);
        setEditForm({});
        loadTableData();
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const primaryKey = getPrimaryKey(activeTable);
      const keyValue = item[primaryKey];
      const endpoint = `${API_URL}/api/admin/database/${activeTable}/${encodeURIComponent(keyValue)}`;

      const response = await fetch(endpoint, { method: "DELETE" });

      if (response.ok) {
        toast.success("Deleted successfully");
        loadTableData();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  const getPrimaryKey = (table: TableName): string => {
    switch (table) {
      case "podcasts": return "podcast_id";
      case "emails": return "email";
      case "papers": return "paper_id";
      case "paper-requests": return "request_id";
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "boolean") return value ? "true" : "false";
    return String(value);
  };

  const getDisplayFields = (table: TableName): string[] => {
    switch (table) {
      case "podcasts":
        return ["podcast_id", "paper_title", "paper_authors", "paper_url", "audio_url", "category", "transcript", "duration", "created_at", "sent_at"];
      case "emails":
        return ["email", "name", "subscribed", "signup_timestamp", "created_at"];
      case "papers":
        return ["paper_id", "title", "authors", "abstract", "pdf_url", "created_at"];
      case "paper-requests":
        return ["request_id", "paper_url", "request_timestamp", "status"];
      default:
        return [];
    }
  };

  const tables: { name: TableName; label: string; icon: string }[] = [
    { name: "podcasts", label: "Podcasts", icon: "🎙️" },
    { name: "emails", label: "Users/Emails", icon: "👥" },
    { name: "papers", label: "Papers", icon: "📄" },
    { name: "paper-requests", label: "Paper Requests", icon: "📋" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Database Manager</CardTitle>
              <CardDescription>View and edit all database tables</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tables.map((table) => (
              <Button
                key={table.name}
                onClick={() => setActiveTable(table.name)}
                variant={activeTable === table.name ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <span>{table.icon}</span>
                <span>{table.label}</span>
              </Button>
            ))}
          </div>

          {/* Reload Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {tableData.count} {tableData.count === 1 ? 'item' : 'items'}
            </div>
            <Button onClick={loadTableData} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? "Loading..." : "Reload"}
            </Button>
          </div>

          {/* Table Data */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : tableData.items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No items found</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {tableData.items.map((item, index) => {
                const isEditing = editingItem && editingItem[getPrimaryKey(activeTable)] === item[getPrimaryKey(activeTable)];
                const displayFields = getDisplayFields(activeTable);

                return (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {displayFields.map((field) => {
                          const value = item[field];
                          const hasValue = value !== null && value !== undefined && value !== "";

                          if (!hasValue && !isEditing) return null;

                          return (
                            <div key={field} className="grid grid-cols-4 gap-4">
                              <div className="font-semibold text-sm text-gray-700 flex items-start pt-2">
                                {field}:
                              </div>
                              <div className="col-span-3">
                                {isEditing ? (
                                  field === "transcript" || field === "abstract" || field === "full_text" ? (
                                    <Textarea
                                      value={formatValue(editForm[field])}
                                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                      className="w-full min-h-[100px] font-mono text-xs"
                                    />
                                  ) : typeof value === "object" && value !== null ? (
                                    <Textarea
                                      value={formatValue(editForm[field])}
                                      onChange={(e) => {
                                        try {
                                          const parsed = JSON.parse(e.target.value);
                                          setEditForm({ ...editForm, [field]: parsed });
                                        } catch {
                                          // Keep as string if not valid JSON
                                          setEditForm({ ...editForm, [field]: e.target.value });
                                        }
                                      }}
                                      className="w-full min-h-[100px] font-mono text-xs"
                                    />
                                  ) : (
                                    <Input
                                      value={formatValue(editForm[field])}
                                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                      className="w-full"
                                      disabled={field === getPrimaryKey(activeTable)}
                                    />
                                  )
                                ) : (
                                  <div className="text-sm text-gray-900 break-words whitespace-pre-wrap">
                                    {typeof value === "object" ? (
                                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    ) : field === "audio_url" || field === "paper_url" || field === "pdf_url" ? (
                                      <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                        {String(value)}
                                      </a>
                                    ) : (
                                      formatValue(value)
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                          {isEditing ? (
                            <>
                              <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save
                              </Button>
                              <Button onClick={handleCancelEdit} size="sm" variant="outline" className="flex items-center gap-2">
                                <X className="w-4 h-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => handleEdit(item)} size="sm" variant="outline" className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button onClick={() => handleDelete(item)} size="sm" variant="destructive" className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
