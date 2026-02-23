"use client";

import { Lead } from "@/lib/api";

interface LeadTableProps {
  leads: Lead[];
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-100 text-red-800";
  if (score >= 70) color = "bg-green-100 text-green-800";
  else if (score >= 40) color = "bg-yellow-100 text-yellow-800";

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {score}
    </span>
  );
}

export default function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md mt-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Score", "Company", "Website", "Email", "Phone", "Location", "Services", "LinkedIn"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScoreBadge score={lead.score} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                  {lead.company_name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 max-w-[200px] truncate">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {new URL(lead.website).hostname.replace("www.", "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[220px]">
                  {lead.emails.length > 0 ? (
                    <div className="space-y-0.5">
                      {lead.emails.slice(0, 2).map((e, i) => (
                        <a
                          key={i}
                          href={`mailto:${e}`}
                          className="block text-blue-600 hover:underline truncate"
                        >
                          {e}
                        </a>
                      ))}
                      {lead.emails.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{lead.emails.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {lead.phone || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {[lead.city, lead.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                  {lead.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {lead.services.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {lead.linkedin ? (
                    <a
                      href={lead.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
