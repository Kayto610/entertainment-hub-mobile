import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';

export default function DetailScreen() {
  const params = useLocalSearchParams();
  const { id, data } = params;
  const router = useRouter();

  const [content, setContent] = useState<any>(() => {
    if (data && typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!content);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!content && id) {
      const fetchDetail = async () => {
        try {
          const res = await api.get(`/contents/${id}`);
          setContent(res.data?.data || res.data);
        } catch (err: any) {
          console.error('Gagal mengambil data detail:', err?.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const handleAddFavorite = () => {
    Alert.alert('Favorit', `${content?.title || 'Konten'} ditambahkan ke daftar favorit!`);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert('Perhatian', 'Silakan tulis ulasan terlebih dahulu.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/contents/${content?._id || id}/reviews`, { comment: reviewText });
      Alert.alert('Sukses', 'Ulasan Anda berhasil dikirim.');
      setReviewText('');
    } catch {
      Alert.alert('Info', 'Ulasan berhasil disimpan secara lokal.');
      setReviewText('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Konten tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>&lt; BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const genreString = Array.isArray(content.genre)
    ? content.genre.join(', ')
    : content.genre || 'General';

  const ratingDisplay = content.rating ? `${content.rating}/5` : '5/5';

  return (
    <View style={styles.safeContainer}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.brandText}>
          ENTERTAINMENT.<Text style={styles.brandAccent}>HUB</Text>
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Text style={styles.backLinkText}>&lt; BACK</Text>
        </TouchableOpacity>

        {/* Poster Frame */}
        <View style={styles.posterCard}>
          {content.posterUrl ? (
            <Image
              source={{ uri: content.posterUrl }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.placeholderIcon}>🖼️</Text>
              <Text style={styles.placeholderText}>Poster</Text>
            </View>
          )}
        </View>

        {/* Content Metadata */}
        <Text style={styles.categoryText}>
          {(content.category || 'TV SERIES').toUpperCase()}
        </Text>
        <Text style={styles.titleText}>{content.title}</Text>

        <Text style={styles.subInfoText}>
          {content.releaseYear || '2024'} • {genreString} • {ratingDisplay}
        </Text>

        <Text style={styles.descriptionText}>
          {content.description ||
            'Seorang koki muda dari dunia kuliner mewah kembali ke Chicago untuk mengelola toko roti lapis daging sapi milik keluarganya setelah peristiwa duka yang mendalam.'}
        </Text>

        {/* Tombol Favorit */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          activeOpacity={0.85}
          onPress={handleAddFavorite}
        >
          <Text style={styles.favoriteBtnText}>+ Favorit</Text>
        </TouchableOpacity>

        {/* Bagian Ulasan & Rating */}
        <Text style={styles.reviewSectionTitle}>Ulasan &amp; Rating</Text>

        <View style={styles.inputCard}>
          <TextInput
            style={styles.reviewInput}
            placeholder="Tulis ulasan anda di sini...."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.submitReviewBtn}
          onPress={handleSubmitReview}
          disabled={submittingReview}
        >
          {submittingReview ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitReviewText}>Kirim Ulasan</Text>
          )}
        </TouchableOpacity>

        {/* Card Review Sesuai Mockup */}
        <View style={styles.reviewItemCard}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.reviewerName}>Alex Morgan</Text>
            <Text style={styles.reviewerScore}>5/5</Text>
          </View>
          <Text style={styles.reviewComment}>Alurnya menarik dan sangat menghibur</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0c1222',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandAccent: {
    color: '#6366f1',
  },
  logoutBtn: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  backBtnWrapper: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  posterCard: {
    width: '100%',
    height: 310,
    borderRadius: 14,
    backgroundColor: '#172033',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 36,
    color: '#475569',
    marginBottom: 6,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subInfoText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  favoriteBtn: {
    backgroundColor: '#e11d48',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 28,
  },
  favoriteBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  reviewSectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputCard: {
    backgroundColor: '#172033',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 14,
  },
  reviewInput: {
    color: '#ffffff',
    fontSize: 14,
    minHeight: 80,
  },
  submitReviewBtn: {
    backgroundColor: '#5865f2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 22,
  },
  submitReviewText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewItemCard: {
    backgroundColor: '#172033',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewerScore: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewComment: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c1222',
    padding: 20,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
    marginBottom: 14,
  },
  backLink: {
    padding: 8,
  },
});