"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { AdminDoctor, AdminDoctorSearchParams } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loader";
import { Modal } from "@/components/ui/modal";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
  "Psychiatry",
  "Ophthalmology",
  "Gynecology",
];

export default function AdminDoctorsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modal state for soft delete
  const [selectedDoctorForDelete, setSelectedDoctorForDelete] = useState<AdminDoctor | null>(null);

  const queryParams: AdminDoctorSearchParams = {
    page,
    page_size: 10,
    search_query: searchQuery || undefined,
    specialization: specialization || undefined,
    is_verified: verifiedFilter === "ALL" ? undefined : verifiedFilter === "VERIFIED",
    is_active: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
    include_deleted: includeDeleted,
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["admin-doctors", queryParams],
    queryFn: () => adminService.listDoctors(queryParams),
  });

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: ({ id, is_verified }: { id: string; is_verified: boolean }) =>
      adminService.verifyDoctor(id, is_verified),
    onSuccess: (data) => {
      toast.success(data.is_verified ? "Doctor verified successfully!" : "Doctor verification revoked.");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || "Failed to update verification status.");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      currentActive ? adminService.deactivateDoctor(id) : adminService.activateDoctor(id),
    onSuccess: (data) => {
      toast.success(data.is_active ? "Doctor account activated." : "Doctor account deactivated.");
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || "Failed to toggle account status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteDoctor(id),
    onSuccess: () => {
      toast.success("Doctor account soft-deleted successfully.");
      setSelectedDoctorForDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || "Failed to soft delete doctor.");
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
              <span>[ DIRECTORY & GOVERNANCE ]</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
              Doctor Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-mono">
              Verify medical credentials, manage provider account status, and perform soft deletes.
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
                  placeholder="Search name, bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                />
              </div>

              <div>
                <Select
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                >
                  <option value="">All Specializations</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  value={verifiedFilter}
                  onChange={(e) => {
                    setVerifiedFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-sm border-border font-mono text-xs shadow-none"
                >
                  <option value="ALL">Verification: All</option>
                  <option value="VERIFIED">Verified Only</option>
                  <option value="UNVERIFIED">Unverified Only</option>
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
                <span>SHOW SOFT-DELETED DOCTORS</span>
              </label>

              <div>
                FOUND <span className="font-bold text-foreground">{data?.total || 0}</span> RECORDS
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card className="rounded-sm border-border shadow-none">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-hanken uppercase tracking-wider flex items-center justify-between">
              <span>Registered Medical Providers</span>
              <span className="text-xs font-mono text-primary font-bold">[ CLINICAL ROSTER ]</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Manage verification flags and access controls. Changes take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner size={40} />
              </div>
            ) : error ? (
              <div className="p-6 bg-destructive/10 text-destructive text-xs font-mono font-bold text-center border-b border-border">
                [ ERROR: FAILED TO LOAD DOCTOR DIRECTORY. PLEASE TRY AGAIN LATER. ]
              </div>
            ) : data && data.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Fee & Clinic</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-xs">
                    {data.data.map((doc) => (
                      <tr
                        key={doc.id}
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          doc.is_deleted && "opacity-60 bg-muted/20 line-through text-muted-foreground"
                        )}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground font-hanken text-sm">
                            Dr. {doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} {doc.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{doc.email}</div>
                          {doc.qualification && (
                            <div className="text-[11px] text-primary font-bold mt-0.5">{doc.qualification}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                            {doc.specialization}
                          </span>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {doc.experience_years ? `${doc.experience_years} YRS EXP` : "N/A"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-foreground font-bold">₹{Number(doc.consultation_fee || 0).toLocaleString("en-IN")}</div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {doc.hospital_clinic || "PRIVATE PRACTICE"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {doc.is_verified ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ VERIFIED ]
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ UNVERIFIED ]
                              </span>
                            )}

                            {!doc.is_deleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2 font-mono font-bold rounded-sm shadow-none uppercase"
                                disabled={verifyMutation.isPending}
                                onClick={() => verifyMutation.mutate({ id: doc.id, is_verified: !doc.is_verified })}
                              >
                                {doc.is_verified ? "[ REVOKE ]" : "[ VERIFY ]"}
                              </Button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {doc.is_deleted ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ SOFT DELETED ]
                              </span>
                            ) : doc.is_active ? (
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ ACTIVE ]
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                [ DISABLED ]
                              </span>
                            )}

                            {!doc.is_deleted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-6 text-[10px] px-2 font-mono font-bold rounded-sm shadow-none uppercase",
                                  doc.is_active ? "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                )}
                                disabled={toggleActiveMutation.isPending}
                                onClick={() => toggleActiveMutation.mutate({ id: doc.id, currentActive: doc.is_active !== false })}
                              >
                                {doc.is_active ? "[ DISABLE ]" : "[ ACTIVATE ]"}
                              </Button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {!doc.is_deleted ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDoctorForDelete(doc)}
                              className="text-destructive hover:bg-destructive/10 h-7 px-2 font-mono text-[10px] font-bold rounded-sm shadow-none"
                              title="Soft Delete Doctor"
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
                <h3 className="font-bold text-foreground font-hanken text-base">No providers found</h3>
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
          isOpen={!!selectedDoctorForDelete}
          onClose={() => setSelectedDoctorForDelete(null)}
          title="Confirm Provider Deletion"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1">
              <div className="font-bold uppercase tracking-wider">[ ALERT: SOFT-DELETE OPERATION ]</div>
              <p className="text-[11px] leading-relaxed">
                This action marks the doctor account as inactive and deleted without destroying historical appointment records. The doctor will no longer appear in public searches or be able to log in.
              </p>
            </div>

            {selectedDoctorForDelete && (
              <div className="p-3 rounded-sm bg-muted/50 border border-border space-y-1">
                <p><span className="font-bold text-muted-foreground">PROVIDER:</span> Dr. {selectedDoctorForDelete.first_name} {selectedDoctorForDelete.last_name}</p>
                <p><span className="font-bold text-muted-foreground">EMAIL:</span> {selectedDoctorForDelete.email}</p>
                <p><span className="font-bold text-muted-foreground">SPECIALIZATION:</span> {selectedDoctorForDelete.specialization}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedDoctorForDelete(null)} className="rounded-sm font-mono text-xs font-bold shadow-none">
                [ CANCEL ]
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => selectedDoctorForDelete && deleteMutation.mutate(selectedDoctorForDelete.id)}
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
