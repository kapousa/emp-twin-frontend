import React, { useEffect, useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import axios from "axios";
import {getDeleteKnowledgeEndpoint} from "@/configurations/api"

interface Report {
    id: string;
    report_type: string;
    content: string;
    created_at: string;
}

const RoomReportList = ({ sessionId }: { sessionId: string }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sessionId) fetchReports();
    }, [sessionId]);

    const fetchReports = async () => {
        const res = await axios.get(`/rooms/session/${sessionId}/reports`);
        setReports(res.data);
    };

    const downloadPDF = (report: Report) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Boardroom Meeting Minutes", 10, 20);
        doc.setFontSize(12);

        // Split text to wrap inside PDF width
        const splitText = doc.splitTextToSize(report.content, 180);
        doc.text(splitText, 10, 35);

        doc.save(`Report_${report.id.substring(0, 8)}.pdf`);
    };

    return (
        <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                <FileText size={16} /> Session Reports
            </h4>

            <div className="space-y-2">
                {reports.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No reports generated yet.</p>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="p-2 bg-muted/50 rounded-md border flex items-center justify-between">
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold uppercase opacity-60">{report.report_type}</p>
                                <p className="text-xs truncate">{new Date(report.created_at).toLocaleDateString()}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600"
                                onClick={() => downloadPDF(report)}
                            >
                                <Download size={14} />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RoomReportList;