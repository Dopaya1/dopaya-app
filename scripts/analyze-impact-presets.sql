-- Phase 0.2: Analyse Preset-Konsistenz
-- Prüft ob Presets linear sind und berechnet impact_factor
-- Führe dieses Script in Supabase SQL Editor aus

-- 1. Berechne Ratios für alle Presets pro Projekt
WITH preset_ratios AS (
  SELECT 
    id,
    title,
    slug,
    -- Berechne Ratio für jedes Preset (impact / donation)
    CASE WHEN donation_1 > 0 THEN impact_1::numeric / donation_1 ELSE NULL END AS ratio_1,
    CASE WHEN donation_2 > 0 THEN impact_2::numeric / donation_2 ELSE NULL END AS ratio_2,
    CASE WHEN donation_3 > 0 THEN impact_3::numeric / donation_3 ELSE NULL END AS ratio_3,
    CASE WHEN donation_4 > 0 THEN impact_4::numeric / donation_4 ELSE NULL END AS ratio_4,
    CASE WHEN donation_5 > 0 THEN impact_5::numeric / donation_5 ELSE NULL END AS ratio_5,
    CASE WHEN donation_6 > 0 THEN impact_6::numeric / donation_6 ELSE NULL END AS ratio_6,
    CASE WHEN donation_7 > 0 THEN impact_7::numeric / donation_7 ELSE NULL END AS ratio_7
  FROM projects
  WHERE status = 'active' OR status IS NULL
),
-- 2. Sammle alle gültigen Ratios in einem Array
ratios_array AS (
  SELECT 
    id,
    title,
    slug,
    ARRAY_REMOVE(ARRAY[
      ratio_1, ratio_2, ratio_3, ratio_4, ratio_5, ratio_6, ratio_7
    ], NULL) AS ratios
  FROM preset_ratios
),
-- 3. Berechne Statistiken
impact_analysis AS (
  SELECT 
    id,
    title,
    slug,
    ratios,
    ARRAY_LENGTH(ratios, 1) AS num_presets,
    -- Median der Ratios (approximiert durch PERCENTILE_CONT)
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY unnest(ratios)) AS median_ratio,
    -- Mean der Ratios
    AVG(unnest(ratios)) AS mean_ratio,
    -- Standardabweichung
    STDDEV(unnest(ratios)) AS stddev_ratio,
    -- Min/Max für Varianz-Berechnung
    MIN(unnest(ratios)) AS min_ratio,
    MAX(unnest(ratios)) AS max_ratio
  FROM ratios_array
  WHERE ARRAY_LENGTH(ratios, 1) >= 2  -- Mindestens 2 Presets nötig
  GROUP BY id, title, slug, ratios
)
-- 4. Finale Analyse mit Varianz-Berechnung
SELECT 
  id,
  title,
  slug,
  num_presets,
  ROUND(median_ratio::numeric, 6) AS calculated_impact_factor,
  ROUND(mean_ratio::numeric, 6) AS mean_impact_factor,
  ROUND(stddev_ratio::numeric, 6) AS stddev,
  ROUND(min_ratio::numeric, 6) AS min_ratio,
  ROUND(max_ratio::numeric, 6) AS max_ratio,
  -- Varianz in Prozent (relativ zum Median)
  CASE 
    WHEN median_ratio > 0 THEN 
      ROUND((stddev_ratio / median_ratio * 100)::numeric, 2)
    ELSE NULL
  END AS variance_percent,
  -- Status: Konsistent wenn Varianz < 10%
  CASE 
    WHEN median_ratio > 0 AND (stddev_ratio / median_ratio * 100) < 10 THEN '✅ Consistent'
    WHEN median_ratio > 0 AND (stddev_ratio / median_ratio * 100) >= 10 THEN '⚠️ Needs Review'
    ELSE '❌ No Data'
  END AS status,
  -- Empfehlung
  CASE 
    WHEN median_ratio > 0 AND (stddev_ratio / median_ratio * 100) < 10 THEN 
      'Can use median_ratio as impact_factor'
    WHEN median_ratio > 0 AND (stddev_ratio / median_ratio * 100) >= 10 THEN 
      'High variance - manual review recommended'
    ELSE 
      'Insufficient data - manual setup required'
  END AS recommendation
FROM impact_analysis
ORDER BY 
  CASE status
    WHEN '✅ Consistent' THEN 1
    WHEN '⚠️ Needs Review' THEN 2
    ELSE 3
  END,
  variance_percent ASC NULLS LAST;

-- 5. Zusätzlich: Projekte ohne Impact-Daten
SELECT 
  id,
  title,
  slug,
  '❌ No Impact Data' AS status,
  'No presets found - set has_impact = false' AS recommendation
FROM projects
WHERE 
  (status = 'active' OR status IS NULL)
  AND (
    (donation_1 IS NULL OR impact_1 IS NULL)
    AND (donation_2 IS NULL OR impact_2 IS NULL)
    AND (donation_3 IS NULL OR impact_3 IS NULL)
    AND (donation_4 IS NULL OR impact_4 IS NULL)
    AND (donation_5 IS NULL OR impact_5 IS NULL)
    AND (donation_6 IS NULL OR impact_6 IS NULL)
    AND (donation_7 IS NULL OR impact_7 IS NULL)
  );



