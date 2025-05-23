import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changePeriod?: string;
  iconBgColor?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  change,
  changePeriod = "vs mois dernier",
  iconBgColor = "bg-primary"
}: StatCardProps) => {
  const isPositiveChange = change !== undefined && change > 0;
  const isNegativeChange = change !== undefined && change < 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className="h-6 w-6 text-white">{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-slate-900">{value}</div>
                {change !== undefined && (
                  <div className="flex items-center mt-1">
                    <span
                      className={cn(
                        "text-sm font-medium flex items-center",
                        isPositiveChange ? "text-green-600" : "",
                        isNegativeChange ? "text-red-600" : ""
                      )}
                    >
                      {isPositiveChange && (
                        <TrendingUp className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                      )}
                      {isNegativeChange && (
                        <TrendingDown className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                      )}
                      <span className="ml-1">{Math.abs(change)}%</span>
                    </span>
                    <span className="text-sm text-slate-500 ml-2">{changePeriod}</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
