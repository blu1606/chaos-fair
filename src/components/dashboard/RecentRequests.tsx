import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface RequestLog {
  id: string;
  timestamp: string;
  endpoint: string;
  responseTime: string;
  status: 'success' | 'error';
  cost: string;
}

const mockRequests: RequestLog[] = [
  {
    id: '1',
    timestamp: 'Jan 20, 2024 10:42:15',
    endpoint: '/randomness/generate',
    responseTime: '38ms',
    status: 'success',
    cost: '0.5',
  },
  {
    id: '2',
    timestamp: 'Jan 20, 2024 10:41:03',
    endpoint: '/randomness/verify',
    responseTime: '24ms',
    status: 'success',
    cost: '0.2',
  },
  {
    id: '3',
    timestamp: 'Jan 20, 2024 10:39:47',
    endpoint: '/randomness/generate',
    responseTime: '152ms',
    status: 'error',
    cost: '0.0',
  },
  {
    id: '4',
    timestamp: 'Jan 20, 2024 10:38:22',
    endpoint: '/randomness/batch',
    responseTime: '89ms',
    status: 'success',
    cost: '2.5',
  },
  {
    id: '5',
    timestamp: 'Jan 20, 2024 10:37:01',
    endpoint: '/randomness/generate',
    responseTime: '41ms',
    status: 'success',
    cost: '0.5',
  },
  {
    id: '6',
    timestamp: 'Jan 20, 2024 10:35:44',
    endpoint: '/randomness/verify',
    responseTime: '28ms',
    status: 'success',
    cost: '0.2',
  },
  {
    id: '7',
    timestamp: 'Jan 20, 2024 10:34:19',
    endpoint: '/randomness/generate',
    responseTime: '45ms',
    status: 'success',
    cost: '0.5',
  },
  {
    id: '8',
    timestamp: 'Jan 20, 2024 10:32:55',
    endpoint: '/randomness/batch',
    responseTime: '78ms',
    status: 'success',
    cost: '2.5',
  },
];

interface RecentRequestsProps {
  compact?: boolean;
}

const RecentRequests = ({ compact = false }: RecentRequestsProps) => {
  const displayData = compact ? mockRequests.slice(0, 5) : mockRequests;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-5 h-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">
            Recent Activity
          </h3>
        </div>

        <div className="space-y-3">
          {displayData.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {request.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {request.endpoint}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.responseTime}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-accent">
                {request.cost} cr
              </span>
            </div>
          ))}
        </div>

        <Link to="/dashboard/usage" className="block mt-4">
          <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10">
            View all requests
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="p-5 lg:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Recent Requests
            </h3>
            <p className="text-sm text-muted-foreground">Last 10 API calls</p>
          </div>
          <Link to="/dashboard/usage">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Timestamp</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Endpoint</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Response Time</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((request) => (
              <TableRow 
                key={request.id} 
                className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {request.timestamp}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {request.endpoint}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {request.responseTime}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {request.status === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500">Error</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-accent">
                  {request.cost} credits
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default RecentRequests;
