import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export default function HomeScreen() {
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  const fetchContents = async () => {
    try {
      const res = await api.get('/contents');
      setContents(res.data);
    } catch (err) {
      console.error('Gagal mengambil konten:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchContents();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredContents = contents.filter((item) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(q);
    const catMatch = item.category?.toLowerCase().includes(q);
    const genreMatch = Array.isArray(item.genre)
      ? item.genre.some((g: string) => g.toLowerCase().includes(q))
      : false;
    return titleMatch || catMatch || genreMatch;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5865f2" />
      </View>
    );
  }

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

      <View style={styles.body}>
        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies, series, music..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Content List */}
        <FlatList
          data={filteredContents}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5865f2" />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isFav = !!favorites[item._id];
            const ratingValue = item.rating ? item.rating : '4.5';

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/detail/[id]',
                    params: {
                      id: item._id,
                      data: JSON.stringify(item),
                    },
                  })
                }
              >
                {/* Poster Frame */}
                <View style={styles.posterContainer}>
                  {item.posterUrl ? (
                    <Image
                      source={{ uri: item.posterUrl }}
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

                {/* Card Info */}
                <View style={styles.cardFooter}>
                  <View style={styles.titleRow}>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(item._id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.heartIcon, isFav && styles.heartActive]}>
                        {isFav ? '♥' : '♡'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      {item.releaseYear || '2024'} &nbsp;•&nbsp; {item.category || 'Movie'}
                    </Text>

                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {ratingValue}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Tidak ada konten yang cocok.</Text>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>
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
    color: '#5865f2',
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
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141d30',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#24324d',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 20,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 10,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#172236',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#24324d',
    overflow: 'hidden',
    marginBottom: 20,
  },
  posterContainer: {
    width: '100%',
    height: 290,
    backgroundColor: '#1e293b',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#172236',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
  },
  cardFooter: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#131b2d',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  heartIcon: {
    fontSize: 22,
    color: '#94a3b8',
  },
  heartActive: {
    color: '#e11d48',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  ratingBadge: {
    backgroundColor: '#1e283d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2b3b57',
  },
  ratingText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c1222',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});