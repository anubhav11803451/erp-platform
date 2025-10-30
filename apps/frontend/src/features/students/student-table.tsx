// import { DownloadIcon, Loader2 } from 'lucide-react';

// import { Paginator } from '@/components/paginator/paginator';
// import { Button } from '@/components/ui/button';
// import { Flex } from '@/components/ui/flex';
// import { FlexItem } from '@/components/ui/flex-item';
// import {
//     Table,
//     TableBody,
//     TableCaption,
//     TableCell,
//     TableFooter,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';

// import { useScopedI18n } from '@/locales/client';

// import { DatePickerWithRange } from '../shared/date-range';

// export default function TabularView() {
//     const {
//         data,
//         loading,
//         userMarketCurrency,
//         isDownloading,
//         setPayload,
//         handleDownloadGainLossReport,
//     } = usePortfolioReports();

//     let Component: React.ReactNode = (
//         <TableRow>
//             <TableCell colSpan={12}>
//                 <div className="flex min-h-[371px] items-center justify-center">
//                     <div className="flex items-center space-x-2">
//                         <Loader2 className="animate-spin" />
//                     </div>
//                 </div>
//             </TableCell>
//         </TableRow>
//     );
//     if (!loading && data) {
//         Component = data?.items.map((item) => (
//             <TableRow key={getId()} className="[&>td]:text-center">
//                 <TableCell>{formatDateTime(item.adminData.dateTime)}</TableCell>
//                 <TableCell>{item.adminData.transactionType}</TableCell>
//                 <TableCell>{item.adminData.cyrptoAsset}</TableCell>
//                 <TableCell className="border-l">
//                     {formatPortfolioBalance(item.transactionDetails.amount, userMarketCurrency)}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(item.transactionDetails.principal, userMarketCurrency)}
//                 </TableCell>
//                 <TableCell className="border-r">
//                     {formatPortfolioBalance(item.transactionDetails.gain, userMarketCurrency)}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(
//                         item.portfolioRunningStatistics.principal,
//                         userMarketCurrency
//                     )}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(
//                         item.portfolioRunningStatistics.notionalGain,
//                         userMarketCurrency
//                     )}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(
//                         item.portfolioRunningStatistics.realisedGain,
//                         userMarketCurrency
//                     )}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(
//                         item.portfolioRunningStatistics.unrealizedGain,
//                         userMarketCurrency
//                     )}
//                 </TableCell>
//                 <TableCell>
//                     {formatPortfolioBalance(
//                         item.portfolioRunningStatistics.totalValueOfAssets,
//                         userMarketCurrency
//                     )}
//                 </TableCell>
//             </TableRow>
//         ));
//     }

//     return (
//         <div className="border-border z-20 mt-8 rounded-2xl border">
//             <Flex direction="row" alignItems="center" justifyContent="end" gapX={1} className="p-4">
//                 <FlexItem>
//                     <DatePickerWithRange
//                         placeholder={tabularViewT('dateFilterPlaceholder')}
//                         onRangeSelect={(range) =>
//                             setPayload((prev) => ({
//                                 ...prev,
//                                 from: range.time_from,
//                                 to: range.time_to,
//                             }))
//                         }
//                     />
//                 </FlexItem>
//                 <FlexItem>
//                     <Button
//                         size="icon"
//                         variant="outline"
//                         onClick={() => handleDownloadGainLossReport()}
//                         disabled={isDownloading}
//                     >
//                         {isDownloading ? (
//                             <Loader2 className="!size-4 animate-spin" />
//                         ) : (
//                             <DownloadIcon className="!size-4" />
//                         )}
//                     </Button>
//                 </FlexItem>
//             </Flex>
//             <Table className="border-collapse border-spacing-y-2">
//                 <TableCaption className="my-4">{tabularViewT('caption')}</TableCaption>
//                 <TableHeader className="bg-muted/50">
//                     <TableRow className="[&>th]:text-center">
//                         <TableHead colSpan={3}>{headerT('generalTransactionInfo')}</TableHead>
//                         <TableHead className="border-x" colSpan={3}>
//                             {headerT('transactionDetails')}
//                         </TableHead>
//                         <TableHead colSpan={5}>
//                             {headerT('portfolioRunningStatistics')} (USD)
//                         </TableHead>
//                     </TableRow>
//                     <TableRow className="[&>th]:text-center">
//                         <TableHead>{headerT('dateTime')}</TableHead>
//                         <TableHead>{headerT('transactionType')}</TableHead>
//                         <TableHead>{headerT('cryptoAsset')}</TableHead>
//                         <TableHead className="border-l">{headerT('amount')}</TableHead>
//                         <TableHead>{headerT('principal')}</TableHead>
//                         <TableHead className="border-r">{headerT('gain')}</TableHead>
//                         <TableHead>{headerT('principal')}</TableHead>
//                         <TableHead>{headerT('notionalGain')}</TableHead>
//                         <TableHead>{headerT('realisedGain')}</TableHead>
//                         <TableHead>{headerT('unrealisedGain')}</TableHead>
//                         <TableHead>{headerT('totalValueOfAssets')}</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>{Component}</TableBody>
//                 <TableFooter>
//                     <TableRow>
//                         <TableCell colSpan={12}>
//                             <Paginator
//                                 totalItems={data?.total || 0}
//                                 onPageChange={(page) => {
//                                     setPayload((prev) => ({ ...prev, page: page }));
//                                 }}
//                                 onPageSizeChange={(rowsPerPage) => {
//                                     setPayload((prev) => ({ ...prev, pageSize: rowsPerPage }));
//                                 }}
//                             />
//                         </TableCell>
//                     </TableRow>
//                 </TableFooter>
//             </Table>
//         </div>
//     );
// }
