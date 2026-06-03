# Graph Report - src  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 72 nodes · 78 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `InferenceMode` - 2 edges
2. `StreamChunk` - 2 edges
3. `StreamComplete` - 2 edges
4. `ScenarioMetadata` - 2 edges
5. `connectToStream()` - 2 edges
6. `disconnectFromStream()` - 2 edges
7. `fetchScenarios()` - 2 edges
8. `resolveClasses()` - 2 edges
9. `Button()` - 2 edges
10. `Hero Image` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Hero Image` --conceptually_related_to--> `React Logo`  [INFERRED]
  assets/hero.png → assets/react.svg
- `Hero Image` --conceptually_related_to--> `Vite Logo`  [INFERRED]
  assets/hero.png → assets/vite.svg
- `React Logo` --conceptually_related_to--> `Vite Logo`  [INFERRED]
  assets/react.svg → assets/vite.svg

## Import Cycles
- None detected.

## Communities (11 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (6): Feature, features, Partner, partners, MetricCard, metricCards

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (7): TerminalLine, NavbarProps, Button(), ButtonProps, ButtonSize, ButtonVariant, resolveClasses()

### Community 2 - "Community 2"
Cohesion: 0.20
Nodes (7): fetchScenarios(), HardwareStatus, ScenarioId, StreamCallbacks, StreamMetric, SystemConfigResponse, SystemStatus

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (6): connectToStream(), disconnectFromStream(), InferenceMode, ScenarioMetadata, StreamChunk, StreamComplete

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (6): FAQItem, FeatureCard, MarqueeItem, PlaygroundScenario, PricingTier, TerminalStep

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (3): ContainerProps, maxWidthMap, paddingMap

### Community 8 - "Community 8"
Cohesion: 1.00
Nodes (3): Hero Image, React Logo, Vite Logo

## Knowledge Gaps
- **31 isolated node(s):** `ScenarioId`, `StreamMetric`, `HardwareStatus`, `SystemConfigResponse`, `SystemStatus` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `ScenarioId`, `StreamMetric`, `HardwareStatus` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._