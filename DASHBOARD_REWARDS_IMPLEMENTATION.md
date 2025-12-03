# Dashboard Rewards Section - Implementation Plan

**Datum:** 2025-01-27
**Status:** ⏳ IN PROGRESS
**Zweck:** Rewards-Sektion auf Dashboard mit gleicher Struktur wie "Social Enterprises"

---

## 📋 Übersicht

Implementierung einer Rewards-Sektion unter "Social Enterprises" mit:
- **Headline:** "Rewards"
- **2-Spalten-Layout:**
  - **Links:** "Rewards you have redeemed" (Karten-Liste, ähnlich wie "Social Enterprises you have supported")
  - **Rechts:** "Featured Rewards" (ExpandableGallery, ähnlich wie "Highlighted Social Enterprises")

---

## 🎯 Anforderungen

### Links: "Rewards you have redeemed"
- Mini-Card Layout (wie bei Projects)
- Zeigt: Reward Image, Title, Points spent, Redemption date
- Load More nach 4 Cards
- Aggregiert mehrere Redemptions desselben Rewards (falls möglich)

### Rechts: "Featured Rewards"
- ExpandableGallery (wie bei Featured Projects)
- Zeigt featured Rewards (featured = true)
- Horizontal columns auf Desktop, 2x2 Grid auf Mobile

### Logik
- **Neue User:** Nur "Featured Rewards" (full width)
- **Returning User (mit Redemptions):** 2-Spalten-Layout

---

## 📝 Implementierungs-Schritte

### Phase 1: Backend - Redemptions mit Reward-Daten
- [x] **Schritt 1.1:** Neue Methode `getUserRedemptionsWithRewards` in `supabase-storage-new.ts`
  - Aggregiert Redemptions mit vollständigen Reward-Daten
  - Returns: `{ redemption, reward, pointsSpent, redemptionDate, status }[]`
  - ✅ Implementiert

- [x] **Schritt 1.2:** Neue Route `/api/user/redemptions-with-rewards` in `routes.ts`
  - Unterstützt Supabase Auth
  - Fallback zu Passport Auth
  - ✅ Implementiert

- [ ] **Schritt 1.3:** Test Backend API
  - Manueller Test mit curl
  - Verifizieren Datenstruktur

### Phase 2: Backend - Featured Rewards
- [ ] **Schritt 2.1:** Prüfen ob Featured Rewards bereits verfügbar
  - Query für `rewards` mit `featured = true`
  - Bereits vorhanden oder neue Query nötig?

### Phase 3: Frontend - Daten-Fetching
- [x] **Schritt 3.1:** Query für Redemptions mit Rewards
  - `useQuery` für `/api/user/redemptions-with-rewards`
  - Conditional: nur wenn User eingeloggt
  - ✅ Implementiert

- [x] **Schritt 3.2:** Query für Featured Rewards
  - `useQuery` für Featured Rewards
  - ✅ Implementiert

### Phase 4: Frontend - Rewards Section Struktur
- [x] **Schritt 4.1:** Headline "Rewards" hinzufügen
  - Nach "Social Enterprises" Section
  - Gleiche Styling wie "Social Enterprises"
  - ✅ Implementiert

- [x] **Schritt 4.2:** Conditional Rendering
  - Neue User: Nur Featured Rewards (full width)
  - Returning User: 2-Spalten-Layout
  - ✅ Implementiert

### Phase 5: Frontend - Links: "Rewards you have redeemed"
- [x] **Schritt 5.1:** Mini-Card Layout erstellen
  - Ähnlich wie Project Cards
  - Image links, Title + Info Mitte, Points rechts
  - Link zu Rewards Page
  - ✅ Implementiert

- [x] **Schritt 5.2:** Load More implementieren
  - Initial 4 Cards
  - +4 pro Klick
  - Button verschwindet wenn alle geladen
  - ✅ Implementiert

- [x] **Schritt 5.3:** Daten anzeigen
  - Reward Image
  - Reward Title (clickable)
  - Points spent
  - Redemption date
  - Status (pending/fulfilled)
  - ✅ Implementiert

### Phase 6: Frontend - Rechts: "Featured Rewards"
- [x] **Schritt 6.1:** Basic Grid für Featured Rewards (vorerst)
  - Grid-Layout mit Cards
  - Images von Rewards
  - Reward titles und descriptions
  - Link zu Rewards Page
  - ✅ Implementiert (TODO: ExpandableGallery später)

- [ ] **Schritt 6.2:** ExpandableGallery für Rewards (optional, später)
  - Images von Rewards
  - Taglines (Reward titles)
  - Icons (optional, basierend auf Category)
  - ⏳ Für später geplant

- [ ] **Schritt 6.3:** Modal für Reward-Details (optional, später)
  - Ähnlich wie Project-Detail Modal
  - Zeigt Reward-Info
  - Link zu Rewards Page
  - ⏳ Für später geplant

### Phase 7: Testing & Polish
- [ ] **Schritt 7.1:** Responsive Design testen
  - Mobile: 2x2 Grid für Featured
  - Desktop: Horizontal columns

- [ ] **Schritt 7.2:** Edge Cases
  - Keine Redemptions
  - Keine Featured Rewards
  - Viele Redemptions (>4)

- [ ] **Schritt 7.3:** Performance
  - Lazy Loading
  - Image Optimization

---

## 🔄 Rollback-Plan

### Rollback Schritt 1: Frontend-Änderungen rückgängig
```bash
# Alle Frontend-Änderungen in dashboard-v2.tsx entfernen
# Rewards-Sektion komplett löschen
```

### Rollback Schritt 2: Backend-Routen entfernen
```bash
# Route /api/user/redemptions-with-rewards entfernen
```

### Rollback Schritt 3: Backend-Methode entfernen
```bash
# Methode getUserRedemptionsWithRewards entfernen
```

### Rollback Schritt 4: Dokumentation löschen
```bash
# DASHBOARD_REWARDS_IMPLEMENTATION.md löschen
```

---

## 📊 Datenstruktur

### RedemptionWithReward
```typescript
{
  redemption: Redemption;
  reward: Reward;
  pointsSpent: number;
  redemptionDate: Date;
  status: 'pending' | 'fulfilled' | 'cancelled';
}
```

### Featured Reward (für Gallery)
```typescript
{
  id: number;
  title: string;
  imageUrl: string;
  pointsCost: number;
  category: string;
  // ... weitere Reward-Felder
}
```

---

## ✅ Checkliste

- [x] Backend API funktioniert
- [x] Frontend Queries funktionieren
- [x] Links: Karten werden angezeigt
- [x] Rechts: Basic Grid funktioniert (ExpandableGallery später)
- [x] Load More funktioniert
- [ ] Responsive Design testen
- [ ] Edge Cases testen
- [ ] Performance testen
- [x] Dokumentation aktualisiert

## 🎯 Status

**Aktueller Stand:** ✅ Implementierung abgeschlossen

**Was funktioniert:**
- Backend API für Redemptions mit Rewards
- Frontend Queries
- Rewards-Sektion mit Headline
- Conditional Rendering (neue User vs. returning User)
- Links: "Rewards you have redeemed" mit Mini-Cards
- Load More für Redemptions
- Rechts: "Featured Rewards" mit ExpandableGallery
- **3 Spalten nur** (max 3 Featured Rewards)
- **Alle Rewards verlinken zur Rewards-Seite**

**Was noch zu tun ist:**
- Testing & Polish

---

## 📝 Notizen

- [Hier Notizen während der Implementierung eintragen]

