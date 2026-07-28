import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme';

export default function SafetyScreen() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      // 電話アプリがない場合は無視
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ご利用について 🌿</Text>
        </View>

        {/* 免責事項 */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>このアプリについて</Text>
          <Text style={styles.cardBody}>
            「感情日記」は日々の感情を記録し、セルフケアを支援するためのアプリです。
            {'\n\n'}
            記録した情報はお使いの端末内にのみ保存され、外部に送信されることはありません。
          </Text>
        </View>

        {/* 注意事項 */}
        <View style={[styles.card, styles.warningCard]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardTitle}>ご注意ください</Text>
          <Text style={styles.cardBody}>
            本アプリは医療機関の診断・治療に代わるものではありません。
            {'\n\n'}
            心身の不調が強い場合は、無理をせず専門医や相談機関をご利用ください。
            {'\n\n'}
            気分の記録は、あくまで日々のセルフケアの一環としてお役立てください。
          </Text>
        </View>

        {/* 相談窓口 */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📞</Text>
          <Text style={styles.cardTitle}>相談窓口</Text>
          <Text style={styles.cardSubtitle}>
            つらい時は、一人で抱え込まないでください
          </Text>

          <HelpLine
            name="いのちの電話"
            number="0120-783-556"
            description="毎日16時〜21時、毎月10日は8時〜翌8時"
            onCall={handleCall}
          />
          <HelpLine
            name="よりそいホットライン"
            number="0120-279-338"
            description="24時間対応"
            onCall={handleCall}
          />
          <HelpLine
            name="こころの健康相談統一ダイヤル"
            number="0570-064-556"
            description="各都道府県の相談窓口に接続"
            onCall={handleCall}
          />
        </View>

        {/* ヒント */}
        <View style={[styles.card, styles.tipCard]}>
          <Text style={styles.cardIcon}>💡</Text>
          <Text style={styles.cardTitle}>セルフケアのヒント</Text>
          <View style={styles.tipList}>
            <TipItem text="毎日の気分を記録する習慣をつけましょう" />
            <TipItem text="十分な睡眠をとることを心がけましょう" />
            <TipItem text="適度な運動は心の健康にも効果的です" />
            <TipItem text="信頼できる人に気持ちを話してみましょう" />
            <TipItem text="好きなことをする時間を大切にしましょう" />
          </View>
        </View>

        <Text style={styles.version}>感情日記 v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HelpLine({
  name,
  number,
  description,
  onCall,
}: {
  name: string;
  number: string;
  description: string;
  onCall: (number: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.helpLine}
      activeOpacity={0.7}
      onPress={() => onCall(number)}
    >
      <View style={styles.helpLineInfo}>
        <Text style={styles.helpLineName}>{name}</Text>
        <Text style={styles.helpLineDesc}>{description}</Text>
      </View>
      <View style={styles.helpLineNumber}>
        <Text style={styles.helpLineNumberText}>{number}</Text>
        <Text style={styles.helpLineAction}>タップで電話</Text>
      </View>
    </TouchableOpacity>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipBullet}>🌱</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
    backgroundColor: '#FFFDF5',
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
    backgroundColor: '#F5FFF9',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  cardBody: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  helpLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helpLineInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  helpLineName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  helpLineDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  helpLineNumber: {
    alignItems: 'flex-end',
  },
  helpLineNumberText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  helpLineAction: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  tipList: {
    marginTop: Spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
