"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { AdminPatient, AdminPatientSearchParams } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];

export default function AdminPatientsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modal state for soft delete
  const [selectedPatientForDelete, setSelectedPatientForDelete] = useState<AdminPatient | null>(null);

  const queryParams: AdminPatientSearchParams = {
    page,
    page_size: 10,
    search_query: searchQuery || undefined,
    gender: gender || undefined,
    blood_group: bloodGroup || undefined,
    is_active: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
    include_deleted: includeDeleted,
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-patients", queryParams],
    queryFn: () => adminService.listPatients(queryParams),
  });

  // Mutations
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      currentActive ? adminService.deactivatePatient(id) : adminService.activatePatient(id),
    onSuccess: (data) => {
      toast.success(data.is_active ? "Patient account activated." : "Patient account deactivated.");
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || "Failed to toggle patient status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePatient(id),
    onSuccess: () => {
      toast.success("Patient account soft-deleted successfully.");
      setSelectedPatientForDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || "Failed to soft delete patient.");
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
              <span>[ PATIENT DIRECTORY & ACCESS ]</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Patient Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Oversee patient records, monitor platform activity, and manage account lifecycle with soft-delete capabilities.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 border-border font-mono font-bold shadow-none rounded-sm uppercase tracking-wider"
          >
            <span>{isRefetching ? "[ REFRESHING... ]" : "[ REFRESH DATA ]"}</span>
          </Button>
        </div>

        {/* Filter & Search Toolbar */}
        <Card className="rounded-sm border-border shadow-none">
          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Input
                  placeholder="Search name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                />
              </div>

              <div>
                <Select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                >
                  <option value="">All Genders</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  value={bloodGroup}
                  onChange={(e) => {
                    setBloodGroup(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                >
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  value={activeFilter}
                  onChange={(e) => {
                    setActiveFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                >
                  <option value="ALL">Status: All</option>
                  <option value="ACTIVE">Active Accounts</option>
                  <option value="DISABLED">Disabled Accounts</option>
                </Select>
              </div>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground font-mono">
              <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-foreground">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => {
                    setIncludeDeleted(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded-sm border-input text-primary focus:ring-primary"
                />
                <span>SHOW SOFT-DELETED PATIENTS</span>
              </label>

              <div>
                FOUND <span className="font-bold text-foreground">{data?.total || 0}</span> RECORDS
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="rounded-sm border-border shadow-none">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-hanken uppercase tracking-wider flex items-center justify-between">
              <span>Registered Patient Directory</span>
              <span className="text-xs font-mono text-primary font-bold">[ CLINICAL CENSUS ]</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              View patient demographics and manage account access.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner size={40} />
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 text-destructive text-xs font-mono font-bold text-center border-b border-border">
                [ ERROR: FAILED TO LOAD PATIENT DIRECTORY. PLEASE TRY AGAIN LATER. ]
              </div>
            ) : data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Demographics</th>
                      <th className="py-3 px-4">Blood Group</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-xs">
                    {data.data.map((pt) => (
                      <tr
                        key={pt.id}
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          pt.is_deleted && "opacity-60 bg-muted/20 line-through text-muted-foreground"
                        )}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground font-hanken text-sm">
                            {pt.first_name} {pt.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {pt.id.slice(0, 8)}...</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-xs text-foreground">
                            <span className="font-bold text-muted-foreground">EMAIL:</span> {pt.email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-bold text-muted-foreground">TEL:</span> {pt.phone_number || "NO PHONE"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-foreground font-bold">{pt.gender || "NOT SPECIFIED"}</div>
                          <div className="text-[11px] text-muted-foreground uppercase">
                            {pt.date_of_birth ? `${calculateAge(pt.date_of_birth)} YRS (${pt.date_of_birth})` : "DOB UNKNOWN"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {pt.blood_group ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 uppercase tracking-wider">
                              [ {pt.blood_group} ]
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-bold uppercase">[ N/A ]</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {pt.is_deleted ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ SOFT DELETED ]
                              </span>
                            ) : pt.is_active ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ ACTIVE ]
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ DISABLED ]
                              </span>
                            )}

                            {!pt.is_deleted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-6 text-[10px] px-2 font-mono font-bold rounded-sm shadow-none uppercase",
                                  pt.is_active ? "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                )}
                                disabled={toggleActiveMutation.isPending}
                                onClick={() => toggleActiveMutation.mutate({ id: pt.id, currentActive: pt.is_active })}
                              >
                                {pt.is_active ? "[ DISABLE ]" : "[ ACTIVATE ]"}
                              </Button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {!pt.is_deleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPatientForDelete(pt)}
                              className="text-destructive hover:bg-destructive/10 h-7 px-2 font-mono text-[10px] font-bold rounded-sm shadow-none"
                              title="Soft Delete Patient"
                            >
                              [ DEL ]
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">[ ARCHIVED ]</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2 font-mono">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">[ EMPTY DIRECTORY ]</div>
                <h3 className="font-bold text-foreground font-hanken text-base">No patients found</h3>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search query or filters.
                </p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border font-mono text-xs">
                <div className="text-muted-foreground">
                  PAGE <span className="font-bold text-foreground">{data.page}</span> OF{" "}
                  <span className="font-bold text-foreground">{data.total_pages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-sm font-mono text-xs font-bold shadow-none"
                  >
                    [ PREV ]
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages}
                    className="rounded-sm font-mono text-xs font-bold shadow-none"
                  >
                    [ NEXT ]
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Soft Delete Confirmation Modal */}
        <Modal
          isOpen={!!selectedPatientForDelete}
          onClose={() => setSelectedPatientForDelete(null)}
          title="Confirm Patient Deletion"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1">
              <div className="font-bold uppercase tracking-wider">[ ALERT: SOFT-DELETE OPERATION ]</div>
              <p className="text-[11px] leading-relaxed">
                This action marks the patient account as inactive and deleted without destroying medical history or appointment records. The patient will no longer be able to log in or book consultations.
              </p>
            </div>

            {selectedPatientForDelete && (
              <div className="p-3 rounded-sm bg-muted/50 border border-border space-y-1">
                <p><span className="font-bold text-muted-foreground">PATIENT:</span> {selectedPatientForDelete.first_name} {selectedPatientForDelete.last_name}</p>
                <p><span className="font-bold text-muted-foreground">EMAIL:</span> {selectedPatientForDelete.email}</p>
                <p><span className="font-bold text-muted-foreground">PHONE:</span> {selectedPatientForDelete.phone_number || "N/A"}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPatientForDelete(null)} className="rounded-sm font-mono text-xs font-bold shadow-none">
                [ CANCEL ]
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => selectedPatientForDelete && deleteMutation.mutate(selectedPatientForDelete.id)}
                className="gap-2 rounded-sm font-mono text-xs font-bold shadow-none uppercase"
              >
                {deleteMutation.isPending ? "[ DELETING... ]" : "[ CONFIRM DELETE ]"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
