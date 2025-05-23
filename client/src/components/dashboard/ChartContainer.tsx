import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartContainerProps {
  title: string;
  type: "bar" | "pie";
  data: any[];
  labels?: string[];
  colors?: string[];
  dataKey?: string;
  children?: React.ReactNode;
}

const COLORS = ["#2563eb", "#4f46e5", "#22c55e", "#ec4899", "#f97316"];

const ChartContainer = ({
  title,
  type,
  data,
  labels,
  colors = COLORS,
  dataKey = "value",
  children,
}: ChartContainerProps) => {
  return (
    <Card>
      <div className="p-5 border-b border-slate-200">
        <h3 className="text-lg leading-6 font-medium text-slate-900">{title}</h3>
      </div>
      <CardContent className="p-5">
        <div className="h-80 relative">
          {type === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey={dataKey} fill={colors[0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {type === "pie" && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey={dataKey}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
