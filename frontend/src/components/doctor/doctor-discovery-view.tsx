"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { doctorService } from "@/services/doctor.service";
import { DoctorDetail, DoctorSearchParams } from "@/types/doctor";

interface DoctorDiscoveryViewProps {
  baseRoute?: string; // e.g. "/dashboard/patient/doctors" or "/doctors"
}

export const DoctorDiscoveryView: React.FC<DoctorDiscoveryViewProps> = ({
  baseRoute = "/dashboard/patient/doctors",
}) => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [maxFee, setMaxFee] = useState<string>("");
  const [minExp, setMinExp] = useState<string>("");
  const [sortBy, setSortBy] = useState("experience_desc");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Build query params
  const queryParams: DoctorSearchParams = {
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    specialization: specialization.trim() || undefined,
    city: city.trim() || undefined,
    max_fee: maxFee ? Number(maxFee) : undefined,
    min_experience: minExp ? Number(minExp) : undefined,
    sort_by: sortBy as DoctorSearchParams["sort_by"],
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => doctorService.searchDoctors(queryParams),
    staleTime: 60 * 1000,
  });

  const handleResetFilters = () => {
    setSearch("");
    setSpecialization("");
    setCity("");
    setMaxFee("");
    setMinExp("");
    setSortBy("experience_desc");
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Search Banner */}
      <div className="rounded-sm border border-border bg-card p-6 md:p-8 text-card-foreground shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary border border-primary/20 uppercase tracking-wider">
            <span>[ DIRECTORY • ACTIVE ]</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-hanken">
            Find Your Specialist
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-mono">
            Browse verified medical practitioners, filter by specialization, consultation fees, and experience, and view weekly availability schedules.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="font-mono font-bold shadow-none rounded-sm border-border uppercase tracking-wider h-9 px-4"
          >
            <span>{isFetching ? "[ UPDATING... ]" : "[ REFRESH LIST ]"}</span>
          </Button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative max-w-3xl">
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="[ SEARCH BY DOCTOR NAME, SPECIALIZATION, CLINIC, OR KEYWORDS... ]"
          className="w-full h-12 px-4 rounded-sm bg-card text-foreground font-mono text-sm shadow-none border-border focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/70"
        />
      </div>

      {/* Filter & Sort Bar */}
      <Card className="rounded-sm border border-border shadow-none bg-card">
        <CardHeader className="py-4 px-6 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="font-hanken text-base font-bold uppercase tracking-wider text-foreground">
              <span>Filter & Sort Practitioners</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-7 px-3"
            >
              [ RESET FILTERS ]
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Specialization
            </label>
            <Input
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. Cardiology"
              className="h-9 text-xs font-mono rounded-sm shadow-none border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              City / Location
            </label>
            <Input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. New York"
              className="h-9 text-xs font-mono rounded-sm shadow-none border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Max Fee (₹ INR)
            </label>
            <Input
              type="number"
              value={maxFee}
              onChange={(e) => {
                setMaxFee(e.target.value);
                setPage(1);
              }}
              placeholder="Any Fee"
              className="h-9 text-xs font-mono rounded-sm shadow-none border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Min Exp (Yrs)
            </label>
            <Input
              type="number"
              value={minExp}
              onChange={(e) => {
                setMinExp(e.target.value);
                setPage(1);
              }}
              placeholder="0+ Years"
              className="h-9 text-xs font-mono rounded-sm shadow-none border-border"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Sort By
            </label>
            <Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="h-9 text-xs font-mono rounded-sm shadow-none border-border"
            >
              <option value="experience_desc">Most Experienced</option>
              <option value="fee_asc">Lowest Fee</option>
              <option value="fee_desc">Highest Fee</option>
              <option value="name_asc">Name (A - Z)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold tracking-tight font-hanken uppercase text-foreground">
            Available Specialists
          </h2>
          <div className="flex items-center gap-3">
            {isFetching && !isLoading && (
              <span className="font-mono text-xs text-primary animate-pulse">
                [ UPDATING... ]
              </span>
            )}
            {data && (
              <div className="rounded-sm border border-border bg-muted/20 px-2 py-0.5 font-mono text-xs font-bold uppercase text-muted-foreground">
                [ TOTAL: {data.total} {data.total === 1 ? "DOCTOR" : "DOCTORS"} ]
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 font-mono text-sm text-muted-foreground">
            [ LOADING MEDICAL DIRECTORY... ]
          </div>
        ) : isError ? (
          <Card className="rounded-sm border border-destructive/40 bg-card py-12 text-center shadow-none">
            <CardContent className="space-y-3">
              <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-3 font-mono text-xs font-bold text-destructive max-w-xs mx-auto">
                [ DIRECTORY LOAD FAILED ]
              </div>
              <p className="text-base font-bold font-hanken uppercase text-foreground">Failed to load doctor directory</p>
              <p className="text-xs font-mono text-muted-foreground">Please check your network connection and try again.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border"
              >
                [ RETRY SEARCH ]
              </Button>
            </CardContent>
          </Card>
        ) : !data || data.data.length === 0 ? (
          <Card className="rounded-sm border border-border bg-card py-16 text-center shadow-none">
            <CardContent className="space-y-3">
              <div className="rounded-sm border border-border bg-muted/20 p-3 font-mono text-xs text-muted-foreground max-w-xs mx-auto">
                [ NO MATCHING PRACTITIONERS ]
              </div>
              <h3 className="text-base font-bold font-hanken uppercase text-foreground">No Doctors Match Your Filters</h3>
              <p className="text-sm font-mono text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search terms, clearing location filters, or resetting experience and fee criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border"
              >
                [ RESET ALL FILTERS ]
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((doc: DoctorDetail) => (
                <Card
                  key={doc.id}
                  className="rounded-sm border border-border bg-card shadow-none flex flex-col justify-between hover:border-primary/50 transition-all duration-200 overflow-hidden"
                >
                  <div>
                    <CardHeader className="pb-3 border-b border-border bg-muted/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono font-bold text-lg shrink-0 overflow-hidden">
                            {doc.profile_photo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={doc.profile_photo}
                                alt={`Dr. ${doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              `${doc.first_name?.[0] || ""}${doc.last_name?.[0] || ""}`
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold font-hanken text-foreground">
                              Dr. {doc.first_name?.replace(/^Dr\.\s*|^Dr\s+/i, "")} {doc.last_name}
                            </CardTitle>
                            <span className="inline-block text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm mt-1 uppercase">
                              {doc.specialization}
                            </span>
                          </div>
                        </div>

                        {doc.is_verified && (
                          <div title="Verified Practitioner" className="shrink-0">
                            <span className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600">
                              [ VERIFIED ]
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-3 font-mono text-xs text-muted-foreground">
                      <div className="flex items-center justify-between text-foreground">
                        <span className="font-bold">{doc.qualification}</span>
                        <span className="border border-border bg-muted/20 px-1.5 py-0.5 rounded-sm font-bold">
                          {doc.experience_years} YRS EXP
                        </span>
                      </div>

                      <div className="border-t border-border/50 pt-2 space-y-1">
                        <div className="truncate text-foreground">
                          [ CLINIC: {doc.hospital_clinic || "PRIVATE PRACTICE"} ]
                        </div>
                        <div className="truncate">
                          [ LOC: {[doc.city, doc.state, doc.country].filter(Boolean).join(", ") || "UNLISTED"} ]
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div className="font-bold text-sm text-foreground">
                          [ FEE: ₹{Number(doc.consultation_fee || 0).toLocaleString("en-IN")} ]
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm uppercase">
                          {doc.availabilities?.length || 0} SLOTS/WK
                        </span>
                      </div>

                      {doc.bio && (
                        <p className="text-xs italic text-muted-foreground line-clamp-2 pt-2 border-t border-border font-sans">
                          &ldquo;{doc.bio}&rdquo;
                        </p>
                      )}
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 bg-transparent">
                    <Button
                      onClick={() => router.push(`${baseRoute}/${doc.id}`)}
                      className="w-full font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none h-9 border border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      [ VIEW PROFILE & SCHEDULE ]
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.total_pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <p className="font-mono text-xs text-muted-foreground">
                  PAGE <span className="font-bold text-foreground">{data.page}</span> OF{" "}
                  <span className="font-bold text-foreground">{data.total_pages}</span> ({data.total} DOCTORS)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-8 px-3"
                  >
                    [ &lt;- PREVIOUS ]
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages || isFetching}
                    className="font-mono text-xs font-bold uppercase tracking-wider rounded-sm shadow-none border-border h-8 px-3"
                  >
                    [ NEXT -&gt; ]
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
