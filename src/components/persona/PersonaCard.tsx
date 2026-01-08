import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Trash2,
  Loader2,
  Settings2,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";

interface Persona {
  id: string;
  persona_name: string;
  persona_role: string;
  avatar_url: string | null;
  status: 'queued' | 'processing' | 'ready' | 'failed';
}

interface PersonaCardProps {
  persona: Persona;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const PersonaCard = ({ persona, onDelete, isDeleting }: PersonaCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isActionDisabled = persona.status !== 'ready';

  const displayName = persona.persona_name || "Unnamed Persona";
  const displayRole = persona.persona_role || "No Role Defined";

  return (
    <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-all relative">
      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        {persona.status !== 'ready' && (
          <Badge variant={persona.status === 'failed' ? "destructive" : "secondary"} className="capitalize">
            {persona.status}
          </Badge>
        )}
      </div>

      {/* ⭐️ Updated Header: Vertical layout with centered content */}
      <CardHeader className="pb-4 pt-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          {persona.avatar_url ? (
            <img
              src={persona.avatar_url}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-muted shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-muted">
              {displayName.charAt(0)}
            </div>
          )}

          {/* Status Indicator Dot */}
          {persona.status === 'ready' && (
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-card rounded-full"></span>
          )}
        </div>

        <div>
          <CardTitle className="text-xl font-bold tracking-tight">{displayName}</CardTitle>
          <CardDescription className="font-medium text-indigo-600/80">{displayRole}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-6 pb-6">
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/persona/${persona.id}/chat`} className="w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full font-semibold"
              disabled={isActionDisabled}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("persona_card.chat_button", "Chat")}
            </Button>
          </Link>

          <Button
            variant="destructive"
            size="sm"
            className="font-semibold"
            onClick={() => onDelete(persona.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("persona_card.delete_button", "Delete")}
              </>
            )}
          </Button>
        </div>

        <Button
          onClick={() => navigate(`/persona/${persona.id}/dashboard`)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
        >
          <Settings2 className="h-4 w-4 mr-2" />
          Manage Settings
        </Button>

        {persona.status === 'failed' && (
          <p className="text-[10px] text-destructive flex items-center justify-center gap-1 mt-2">
            <AlertCircle size={12} /> Creation failed.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaCard;