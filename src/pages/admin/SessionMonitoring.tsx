import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Thêm bộ đôi này
import {
    Search, Filter, X, RefreshCcw,
    PlayCircle, CheckCircle2, AlertOctagon,
    AlertTriangle, Copy, FileText, Star,
    Layers, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

// Import các thứ từ slice và service của mình
import { fetchSessionsThunk, setTab, setPage } from '../../store/features/sessionSlice';
import { ReadingSession } from '../../types/readingSession';
import {
    fetchAllDisputesThunk,
    resetDraft,
    resolveDisputeThunk,
    updateDraft
} from '../../store/features/adminDisputeSlice';
import { clearSelectedDetail, fetchInterpretationDetailThunk } from '@/store/features/interpretationSlice';
import { useAppSelector } from '@/hooks/useAppRedux';

// --- HELPERS (Giữ nguyên logic Badge của ông) ---
const StatusBadge = ({ status, disputeStatus }: { status: string, disputeStatus?: string }) => {
    if (status === 'PROGRESS') return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1 w-fit"><PlayCircle size={12} /> Đang diễn ra</span>;
    if (status === 'COMPLETED') return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Đã hoàn thành</span>;
    if (status === 'DISPUTED') {
        const color = disputeStatus === 'Resolved' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600 border-red-100 animate-pulse';
        return <span className={`${color} px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit`}><AlertTriangle size={12} /> Tranh chấp</span>;
    }
    return null;
};

export default function SessionMonitoring() {
    const dispatch = useDispatch<any>();

    // 1. Lấy dữ liệu từ Redux
    const { pageData, loading, currentTab, currentPage } = useSelector((state: any) => state.sessions);
    const { resolutionDraft } = useSelector((state: any) => state.adminDisputes);

    // 2. State cho Modal (vẫn giữ local vì nó chỉ phục vụ UI hiển thị chi tiết)
    const [selectedSession, setSelectedSession] = useState<ReadingSession | null>(null);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const { selectedDetail, loading: interpLoading } = useAppSelector((state: any) => state.interpretation);


    const handleOpenResolve = (session: ReadingSession) => {
        // Nếu mở ca mới thì mới reset draft, còn nếu quay lại ca cũ thì giữ nguyên
        if (resolutionDraft.disputeId !== session.id) {
            dispatch(updateDraft({ disputeId: session.id, adminNote: '', status: 'RESOLVED_REJECT' }));
        }
        setSelectedSession(session);
        // Gọi Thunk lấy chi tiết luận giải
        dispatch(fetchInterpretationDetailThunk(session.id));
        setIsResolveModalOpen(true);

    };

    const handleConfirmResolve = async () => {
        if (!resolutionDraft.adminNote) return alert("Vui lòng nhập lý do xử lý!");

        await dispatch(resolveDisputeThunk({
            id: resolutionDraft.disputeId,
            data: { status: resolutionDraft.status, adminNote: resolutionDraft.adminNote }
        }));

        setIsResolveModalOpen(false);
        // Xử lý xong thì reset draft cho sạch
        dispatch(resetDraft());
    };
    // 3. Hiệu ứng gọi API (Mỗi khi Tab hoặc Page thay đổi)
    useEffect(() => {
        dispatch(fetchSessionsThunk({
            tab: currentTab,
            page: currentPage,
            size: 5 // Cứng 5 item/trang như ông yêu cầu
        }));
    }, [dispatch, currentTab, currentPage]);

    const handleTabChange = (tabId: string) => {
        dispatch(setTab(tabId));
    };

    const handlePageChange = (newPage: number) => {
        dispatch(setPage(newPage));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(`Đã copy ID: ${text}`);
    };

    const handleOpenDetail = (session: ReadingSession) => {
        // 1. Set session để Modal có data cơ bản (Tên, ID...) hiện lên ngay
        setSelectedSession(session);

        // 2. Clear data cũ của phiên trước (tránh râu ông nọ cắm cằm bà kia)
        dispatch(clearSelectedDetail());

        // 3. Bắn Thunk đi lôi "luận giải" từ API về
        dispatch(fetchInterpretationDetailThunk(session.id));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 p-6 font-sans">

            {/* HEADER */}
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">Giám Sát Phiên</h1>

                </div>
                {loading && <RefreshCcw className="animate-spin text-purple-600" size={20} />}
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { id: 'live', label: 'Đang diễn ra', icon: PlayCircle },
                    { id: 'completed', label: 'Đã hoàn thành', icon: CheckCircle2 },
                    { id: 'dispute', label: 'Tranh chấp', icon: AlertOctagon }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${currentTab === tab.id ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* TABLE AREA */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Reader</th>
                                <th className="px-6 py-4">Khách</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Bắt đầu lúc</th>
                                <th className="px-6 py-4 text-right">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pageData?.content.map((session: ReadingSession) => (
                                <tr key={session.id} className="hover:bg-purple-50/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">#{session.id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <p className="font-bold text-slate-700">{session.reader?.fullName || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <p className="font-medium text-slate-700">{session.customer?.fullName || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={session.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(session.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenDetail(session)} // Gọi hàm "tổng lực" ở đây
                                            className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-200 transition-all"
                                        >
                                            Chi tiết
                                        </button>
                                        {currentTab === 'dispute' && session.status === 'DISPUTED' && (
                                            <button
                                                onClick={() => handleOpenResolve(session)}
                                                className="bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-red-100 transition-all flex items-center gap-1"
                                            >
                                                <AlertTriangle size={12} /> Giải quyết ngay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* --- MODAL GIẢI QUYẾT (RESOLVE MODAL) --- */}
                {isResolveModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-red-100">
                            <div className="p-5 bg-red-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold">Quyết định xử lý</h3>
                                    <p className="text-xs opacity-80">Phiên tranh chấp #{resolutionDraft.disputeId}</p>
                                </div>
                                <button onClick={() => setIsResolveModalOpen(false)} className="hover:bg-red-700 p-1 rounded-full"><X size={20} /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Lựa chọn trạng thái */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Hình thức xử lý</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => dispatch(updateDraft({ status: 'RESOLVED_REFUND' }))}
                                            className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${resolutionDraft.status === 'RESOLVED_REFUND' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                                        >
                                            Hoàn tiền
                                        </button>
                                        <button
                                            onClick={() => dispatch(updateDraft({ status: 'RESOLVED_REJECT' }))}
                                            className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${resolutionDraft.status === 'RESOLVED_REJECT' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400'}`}
                                        >
                                            Bác bỏ khiếu nại
                                        </button>
                                    </div>
                                </div>

                                {/* Ghi chú - Lưu draft vào Redux mỗi khi gõ */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Lý do xử lý (Lưu vết Admin)</label>
                                    <textarea
                                        value={resolutionDraft.adminNote}
                                        onChange={(e) => dispatch(updateDraft({ adminNote: e.target.value }))}
                                        placeholder="Nhập lý do tại sao bạn đưa ra quyết định này..."
                                        className="w-full h-32 p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsResolveModalOpen(false)}
                                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        Để sau
                                    </button>
                                    <button
                                        onClick={handleConfirmResolve}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200"
                                    >
                                        Xác nhận xử lý
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {pageData?.content.length === 0 && !loading && (
                    <div className="p-10 text-center text-gray-400 italic">Không có phiên nào ở mục này.</div>
                )}

                {/* PAGINATION CONTROLS */}
                <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        Tổng số: <b>{pageData?.totalElements || 0}</b> bản ghi
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            disabled={pageData?.first || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 border rounded-lg hover:bg-white disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-purple-700">Trang {currentPage + 1} / {pageData?.totalPages || 1}</span>
                        <button
                            disabled={pageData?.last || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-2 border rounded-lg hover:bg-white disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL DETAIL (Giữ nguyên UI của ông, chỉ thay map data) --- */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* HEADER */}
                        <div className="p-6 text-white flex justify-between items-center bg-gradient-to-r from-purple-800 to-indigo-900 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <FileText size={20} /> Chi tiết hồ sơ phiên #{selectedSession.id}
                                </h3>
                                <p className="text-xs opacity-70 mt-1">Khởi tạo ngày: {new Date(selectedSession.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSession(null)}
                                className="hover:rotate-90 transition-all p-2 bg-white/10 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="grid grid-cols-12 gap-6">

                                {/* CỘT TRÁI: THÔNG TIN PHIÊN & BÀI (6/12) */}
                                <div className="col-span-12 lg:col-span-7 space-y-6">
                                    {/* Box 1: Câu hỏi & Giá */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                            <Layers size={16} /> Nội dung tư vấn
                                        </h4>
                                        <div className="space-y-4">
                                            {/* THÔNG TIN KHÁCH HÀNG (MỚI) */}
                                            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                                    {selectedSession.customer?.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khách hàng:</span>
                                                        <p className="text-sm font-black text-slate-800">{selectedSession.customer?.fullName || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                                            <span className="font-semibold text-purple-600">NS:</span>
                                                            {/* Giả định trường dob trong Customer Entity */}
                                                            {selectedSession.customer?.birthDate ? new Date(selectedSession.customer?.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* THÔNG TIN PHIÊN (GIỮ LẠI VÀ TINH CHỈNH) */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Chủ đề</span>
                                                    <span className="text-sm font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg w-fit">
                                                        {selectedSession.question?.topic?.name || 'Tình duyên'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Phí dịch vụ</span>
                                                    <span className="text-lg font-black text-orange-600 font-mono">
                                                        {selectedSession.amount?.toLocaleString()}đ
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Câu hỏi của khách:</p>
                                                <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 leading-relaxed relative">
                                                    <span className="absolute -top-2 -left-1 text-3xl text-slate-200 font-serif">“</span>
                                                    {selectedSession.question?.questionText || 'N/A'}
                                                    <span className="absolute -bottom-5 -right-1 text-3xl text-slate-200 font-serif">”</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Box 2: Trải bài Tarot */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                                            <Star size={16} className="text-yellow-500" /> Các lá bài trong phiên
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4">
                                            {selectedSession.selectedCards?.map((card, idx) => (
                                                <div
                                                    key={card.cardId || idx}
                                                    className="flex gap-4 p-4 border rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
                                                >
                                                    {/* Ảnh bài - Dùng imageUrl */}
                                                    <div className="relative w-20 h-32 flex-shrink-0 shadow-lg rounded-lg overflow-hidden border-2 border-white group-hover:border-purple-200 transition-all">
                                                        <img
                                                            src={card.imageUrl}
                                                            alt={card.nameVi}
                                                            className={`w-full h-full object-cover ${card.reversed ? 'rotate-180' : ''}`}
                                                        />
                                                        {card.reversed && (
                                                            <div className="absolute top-1 right-1 bg-red-500 text-[10px] text-white px-1.5 rounded-full font-bold uppercase shadow-sm">
                                                                Ngược
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Thông tin bài */}
                                                    <div className="flex flex-col justify-center">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                                                                {card.cardNumber}
                                                            </span>
                                                            <p className="font-black text-slate-800 text-lg">{card.nameVi}</p>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <span className={`w-2 h-2 rounded-full ${card.reversed ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                                                Trạng thái: <b className={card.reversed ? 'text-red-600' : 'text-emerald-600'}>
                                                                    {card.reversed ? 'Lá bài ngược' : 'Lá bài xuôi'}
                                                                </b>
                                                            </p>
                                                            <p className="text-xs text-gray-400 italic">ID bài: #{card.cardId}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {(!selectedSession.selectedCards || selectedSession.selectedCards.length === 0) && (
                                                <div className="py-10 text-center border-2 border-dashed rounded-2xl text-gray-400 text-sm">
                                                    Chưa có dữ liệu lá bài cho phiên này.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: CHI TIẾT TRANH CHẤP & LUẬN GIẢI (5/12) */}
                                <div className="col-span-12 lg:col-span-5 space-y-6">

                                    {/* BOX 1: ĐƠN KHIẾU NẠI TỪ KHÁCH */}
                                    <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-red-600 uppercase mb-4 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Đơn khiếu nại từ khách
                                        </h4>

                                        <div className="space-y-4">
                                            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                                                <p className="text-xs text-gray-500 mb-1 font-bold">Lý do khiếu nại:</p>
                                                <p className="text-sm text-slate-700 italic leading-relaxed">
                                                    {/* Giả sử lý do nằm trong object session hoặc dispute */}
                                                    "{selectedSession.disputeReason || 'Nội dung khiếu nại đang được cập nhật...'}"
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 mb-2 font-bold flex items-center gap-1">
                                                    <ImageIcon size={14} /> Hình ảnh bằng chứng ({selectedSession.disputeEvidences?.length || 0})
                                                </p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedSession.disputeEvidences?.map((img: string | undefined, i: React.Key | null | undefined) => (
                                                        <img key={i} src={img} className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-80 transition-all" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BOX 2: CHI TIẾT LUẬN GIẢI CỦA READER (MỚI THÊM) */}
                                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                                            <FileText size={16} /> Nội dung Reader đã trả lời
                                        </h4>

                                        {interpLoading ? (
                                            <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-blue-600" /></div>
                                        ) : selectedDetail ? (
                                            <div className="space-y-4">
                                                {/* THÔNG TIN READER (MỚI THÊM) */}
                                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                                                    
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Người thực hiện:</p>
                                                        <p className="text-sm font-black text-slate-800">
                                                            {selectedDetail.reader?.fullName || 'Không rõ danh tính'}
                                                            <span className="ml-2 text-[10px] font-normal text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">ID: #{selectedDetail.reader?.id}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Luận giải chi tiết từng lá (Giữ nguyên logic của ông) */}
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((num) => {
                                                        const text = selectedDetail[`interpretation${num}` as keyof typeof selectedDetail];
                                                        return text ? (
                                                            <div key={num} className="bg-white/60 p-3 rounded-xl border border-blue-50">
                                                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Luận giải lá #{num}:</p>
                                                                <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>

                                                {/* Lời khuyên tổng kết */}
                                                <div className="bg-blue-600 p-4 rounded-xl text-white shadow-md shadow-blue-100">
                                                    <p className="text-[10px] font-bold opacity-80 uppercase mb-1 text-blue-100">Lời khuyên & Kết luận:</p>
                                                    <p className="text-sm font-medium leading-relaxed italic">
                                                        "{selectedDetail.advice || 'Reader không để lại lời khuyên tổng kết.'}"
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center border border-dashed border-blue-200 rounded-xl text-gray-400 text-xs italic">
                                                Reader chưa gửi nội dung luận giải cho phiên này.
                                            </div>
                                        )}
                                    </div>

                                    {/* NÚT ACTION CỐ ĐỊNH Ở CUỐI CỘT PHẢI */}
                                    <div className="pt-2">
                                        <p className="text-[10px] text-gray-400 mb-3 text-center italic">
                                            * Hãy đối chiếu nội dung bài và luận giải trước khi quyết định
                                        </p>
                                        {currentTab === 'dispute' && (
                                            <button
                                                onClick={() => handleOpenResolve(selectedSession)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2"
                                            >
                                                <CheckCircle2 size={18} /> Đưa ra quyết định cuối cùng
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}