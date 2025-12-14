import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { 
  createTarotCard, 
  updateTarotCard, 
  fetchCardById,
  clearCurrentCard 
} from '../../redux/tarotCardSlice';
// import { TarotCard } from '../../types/TarotCardTypes';

// Zod schema validation
const tarotCardSchema = z.object({
  cardNumber: z.number({ message: "Số thứ tự là bắt buộc" }),
  nameEn: z.string().min(1, "Tên tiếng Anh là bắt buộc"),
  nameVi: z.string().optional(),
  
  // Sửa dòng arcana: bỏ object config thứ 2 đi
  arcana: z.enum(['MAJOR', 'MINOR']).refine((val) => val !== undefined, {
    message: "Loại Arcana là bắt buộc",
  }),

  suit: z.string().optional(),

  // Sửa imageUrl: optional trước, url sau (và cho phép empty string)
  imageUrl: z.string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "URL ảnh không hợp lệ",
    }),

  uprightMeaning: z.string().optional(),
  reversedMeaning: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(), // sẽ xử lý thành array ở submit
});

type TarotCardFormData = z.infer<typeof tarotCardSchema>;

export default function TarotForm() {
  const { id } = useParams<{ id: string }>(); // nếu có id → edit, không có → add
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentCard, loading } = useAppSelector(state => state.tarotCard);

  const [keywordInput, setKeywordInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TarotCardFormData>({
    resolver: zodResolver(tarotCardSchema),
  });

  const imageUrl = watch('imageUrl');

  // Load card khi edit
  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchCardById(Number(id)));
    }
    return () => {
      dispatch(clearCurrentCard());
    };
  }, [dispatch, isEdit, id]);

  // Fill form khi có data
  useEffect(() => {
    if (isEdit && currentCard) {
      reset({
        cardNumber: currentCard.cardNumber,
        nameEn: currentCard.nameEn,
        nameVi: currentCard.nameVi || '',
        arcana: currentCard.arcana,
        suit: currentCard.suit || '',
        imageUrl: currentCard.imageUrl || '',
        uprightMeaning: currentCard.uprightMeaning || '',
        reversedMeaning: currentCard.reversedMeaning || '',
        description: currentCard.description || '',
        keywords: currentCard.keywords.join(', '),
      });
      setKeywordInput(currentCard.keywords.join(', '));
    }
  }, [currentCard, isEdit, reset]);

  const onSubmit = async (data: TarotCardFormData) => {
    const keywordsArray = data.keywords 
      ? data.keywords.split(',').map(k => k.trim()).filter(k => k)
      : [];

    const payload = {
      ...data,
      keywords: keywordsArray,
    };

    try {
      if (isEdit && id) {
        await dispatch(updateTarotCard({ id: Number(id), dto: payload })).unwrap();
        alert('Cập nhật lá bài thành công!');
      } else {
        await dispatch(createTarotCard(payload)).unwrap();
        alert('Thêm lá bài thành công!');
      }
      navigate('/admin/tarot');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = keywordInput.trim();
      if (value) {
        const current = watch('keywords') || '';
        setValue('keywords', current ? `${current}, ${value}` : value);
        setKeywordInput('');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link
          to="/admin/tarot"
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Chỉnh sửa Bài Tarot' : 'Thêm Bài Tarot Mới'}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số thứ tự <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('cardNumber', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên bài (Tiếng Anh) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('nameEn')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.nameEn && <p className="text-red-500 text-sm mt-1">{errors.nameEn.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên bài (Tiếng Việt)
              </label>
              <input
                type="text"
                {...register('nameVi')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Arcana <span className="text-red-500">*</span>
              </label>
              <select 
                {...register('arcana')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn loại</option>
                <option value="MAJOR">Major Arcana</option>
                <option value="MINOR">Minor Arcana</option>
              </select>
              {errors.arcana && <p className="text-red-500 text-sm mt-1">{errors.arcana.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suit (Nếu là Minor Arcana)
              </label>
              <select 
                {...register('suit')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Không có</option>
                <option value="WANDS">Wands (Gậy)</option>
                <option value="CUPS">Cups (Chén)</option>
                <option value="SWORDS">Swords (Kiếm)</option>
                <option value="PENTACLES">Pentacles (Tiền)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh URL
              </label>
              <input
                type="url"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
            </div>
          </div>

          {/* Preview ảnh */}
          {imageUrl && (
            <div className="my-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview ảnh:</p>
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-w-md max-h-96 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ý nghĩa chính
            </label>
            <textarea
              rows={3}
              {...register('uprightMeaning')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ý nghĩa nghịch
            </label>
            <textarea
              rows={3}
              {...register('reversedMeaning')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              rows={5}
              {...register('description')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              placeholder="Nhập từ khóa, nhấn Enter hoặc dấu phẩy"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input type="hidden" {...register('keywords')} />
            {watch('keywords') && (
              <div className="mt-2 flex flex-wrap gap-2">
                {watch('keywords')?.split(',').map(k => k.trim()).filter(k => k).map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">Nhập từ khóa, cách nhau bởi dấu phẩy hoặc Enter</p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              to="/admin/tarot"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {(isSubmitting || loading) && <Loader2 className="w-5 h-5 animate-spin" />}
              <Save className="w-5 h-5" />
              <span>{isEdit ? 'Cập nhật' : 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}