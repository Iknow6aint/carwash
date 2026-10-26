import { DateText } from "@/components/ui/date-text";
import { MoneyText } from "@/components/ui/money-text";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmptyRow,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EM_DASH, formatShare } from "@/lib/format/text";

import type { Report } from "../schemas/report.schema";

const NO_SALES = "No paid transactions in this range.";

/** Services: cars, share of revenue and revenue, best earner first. */
export function ServicesReportTable({ services }: { services: Report["services"] }) {
  return (
    <TableContainer label="Services">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Service</TableHead>
            <TableHead numeric>Cars</TableHead>
            <TableHead numeric>Share</TableHead>
            <TableHead numeric>Revenue</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? <TableEmptyRow colSpan={4}>{NO_SALES}</TableEmptyRow> : null}
          {services.map((service) => (
            <TableRow key={service.serviceId}>
              <TableCell>{service.name}</TableCell>
              <TableCell numeric>{service.count}</TableCell>
              <TableCell className="text-neutral-700" numeric>
                {formatShare(service.share)}
              </TableCell>
              <TableCell className="font-medium" numeric>
                <MoneyText kobo={service.revenueKobo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Staff: who recorded how many cars, how many adjusted, and the revenue. */
export function StaffReportTable({ staff }: { staff: Report["staff"] }) {
  return (
    <TableContainer label="Staff">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Recorded by</TableHead>
            <TableHead numeric>Cars</TableHead>
            <TableHead numeric>Adjusted</TableHead>
            <TableHead numeric>Revenue</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? <TableEmptyRow colSpan={4}>{NO_SALES}</TableEmptyRow> : null}
          {staff.map((member) => (
            <TableRow key={member.userId}>
              <TableCell>{member.name}</TableCell>
              <TableCell numeric>{member.count}</TableCell>
              <TableCell className="text-neutral-700" numeric>
                {member.adjustedCount || EM_DASH}
              </TableCell>
              <TableCell className="font-medium" numeric>
                <MoneyText kobo={member.revenueKobo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Daily totals, newest day first (the same rows as the daily-totals CSV). */
export function DailyTotalsTable({ days }: { days: Report["days"] }) {
  const newestFirst = [...days].reverse();
  return (
    <TableContainer label="Daily totals">
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Date</TableHead>
            <TableHead numeric>Cars</TableHead>
            <TableHead numeric>Cash</TableHead>
            <TableHead numeric>Transfer</TableHead>
            <TableHead numeric>POS</TableHead>
            <TableHead numeric>Cancelled</TableHead>
            <TableHead numeric>Total</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {newestFirst.map((day) => (
            <TableRow key={day.date}>
              <TableCell className="whitespace-nowrap">
                <DateText format="day" value={day.date} />
              </TableCell>
              <TableCell numeric>{day.count}</TableCell>
              <TableCell numeric>
                <MoneyText kobo={day.cashKobo} />
              </TableCell>
              <TableCell numeric>
                <MoneyText kobo={day.transferKobo} />
              </TableCell>
              <TableCell numeric>
                <MoneyText kobo={day.posKobo} />
              </TableCell>
              <TableCell className="text-neutral-700" numeric>
                {day.cancelledCount || EM_DASH}
              </TableCell>
              <TableCell className="font-medium" numeric>
                <MoneyText kobo={day.totalKobo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
