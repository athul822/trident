import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DISCOVER_POSTS } from '../data/mockData';

export default function DiscoverFeed({ onPostPress, isDarkMode }) {
  const [likedPosts, setLikedPosts] = useState({});
  const theme = isDarkMode ? darkStyles : lightStyles;

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        title: post.title,
        message: `${post.title} - ${post.url}`,
        url: post.url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.feedContainer}>
      {/* Feed Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="compass-outline"
            size={22}
            color={isDarkMode ? '#8AB4F8' : '#1A73E8'}
          />
          <Text style={[styles.headerTitle, theme.headerTitle]}>Discover</Text>
        </View>
        <TouchableOpacity style={styles.gearBtn} activeOpacity={0.7}>
          <Feather
            name="settings"
            size={18}
            color={isDarkMode ? '#9AA0A6' : '#5F6368'}
          />
        </TouchableOpacity>
      </View>

      {/* Feed Posts */}
      {DISCOVER_POSTS.map((post) => {
        const isLiked = likedPosts[post.id];

        return (
          <TouchableOpacity
            key={post.id}
            style={[styles.card, theme.card]}
            activeOpacity={0.9}
            onPress={() => onPostPress(post)}
          >
            {/* Publisher Metadata Header */}
            <View style={styles.cardHeader}>
              <View style={styles.publisherInfo}>
                <Image
                  source={{ uri: post.sourceIcon }}
                  style={styles.sourceIcon}
                  defaultSource={{ uri: 'https://via.placeholder.com/20' }}
                />
                <Text style={[styles.sourceName, theme.sourceName]}>
                  {post.source}
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text style={[styles.timeAgo, theme.timeAgo]}>
                  {post.timeAgo}
                </Text>
              </View>
              <View style={[styles.categoryBadge, theme.categoryBadge]}>
                <Text style={[styles.categoryText, theme.categoryText]}>
                  {post.category}
                </Text>
              </View>
            </View>

            {/* Post Title */}
            <Text style={[styles.postTitle, theme.postTitle]}>
              {post.title}
            </Text>

            {/* Main Post Image */}
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

            {/* Post Snippet/Description */}
            <Text
              style={[styles.postDescription, theme.postDescription]}
              numberOfLines={2}
            >
              {post.description}
            </Text>

            {/* Action Bar Footer */}
            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => toggleLike(post.id)}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#EA4335' : isDarkMode ? '#9AA0A6' : '#5F6368'}
                />
                <Text style={[styles.actionText, theme.actionText]}>
                  {isLiked ? 'Liked' : post.likes}
                </Text>
              </TouchableOpacity>

              <View style={styles.rightFooterActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleShare(post)}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color={isDarkMode ? '#9AA0A6' : '#5F6368'}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={20}
                    color={isDarkMode ? '#9AA0A6' : '#5F6368'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  gearBtn: {
    padding: 6,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  publisherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
    backgroundColor: '#E1E4E8',
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    color: '#80868B',
    marginHorizontal: 6,
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#303134',
  },
  postDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  actionText: {
    fontSize: 13,
    marginLeft: 6,
  },
  rightFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const darkStyles = StyleSheet.create({
  headerTitle: {
    color: '#E8EAED',
  },
  card: {
    backgroundColor: '#303134',
    borderColor: '#3C4043',
  },
  sourceName: {
    color: '#E8EAED',
  },
  timeAgo: {
    color: '#9AA0A6',
  },
  categoryBadge: {
    backgroundColor: 'rgba(138, 180, 248, 0.15)',
  },
  categoryText: {
    color: '#8AB4F8',
  },
  postTitle: {
    color: '#E8EAED',
  },
  postDescription: {
    color: '#BDC1C6',
  },
  actionText: {
    color: '#9AA0A6',
  },
});

const lightStyles = StyleSheet.create({
  headerTitle: {
    color: '#202124',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EAED',
  },
  sourceName: {
    color: '#202124',
  },
  timeAgo: {
    color: '#5F6368',
  },
  categoryBadge: {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
  },
  categoryText: {
    color: '#1A73E8',
  },
  postTitle: {
    color: '#202124',
  },
  postDescription: {
    color: '#5F6368',
  },
  actionText: {
    color: '#5F6368',
  },
});
