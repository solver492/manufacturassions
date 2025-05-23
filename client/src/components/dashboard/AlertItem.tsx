import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/lib/types";

interface AlertItemProps {
  alert: Alert;
}

const AlertItem = ({ alert }: AlertItemProps) => {
  const getIcon = () => {
    switch (alert.type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <li className="py-3">
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-slate-900">{alert.message}</p>
          <p className="mt-1 text-sm text-slate-500">{alert.description}</p>
          <a href={alert.link} className="mt-1 text-xs text-primary">
            Voir détails
          </a>
        </div>
      </div>
    </li>
  );
};

export default AlertItem;
