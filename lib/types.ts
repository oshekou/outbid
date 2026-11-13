/**
 * Domain types. These mirror the Postgres tables in BUILD_PLAN.md section 7
 * (camelCase here, snake_case in SQL). Money is always integer cents.
 * Every row has `id` and `createdAt` (ISO string).
 */

export type ISODate = string;
export type Cents = number;

type Row = { id: string; createdAt: ISODate };

export type AuctionStatus = "draft" | "live" | "closed" | "settled";

export type Auction = Row & {
  slug: string;
  name: string;
  schoolName: string;
  opensAt: ISODate;
  closesAt: ISODate;
  status: AuctionStatus;
  nonprofitSlug: string;
  nonprofitName: string;
  nonprofitEin: string;
  everyorgFundraiserId: string | null;
  allowCustomSquads: boolean;
  minIncrementCents: Cents;
  socialHandle: string | null;
  approverName: string | null;
  reachFamilies: number;
  reachFollowers: number;
  organizerId: string;
};

export type TeamKind = "grade" | "faculty";

export type Team = Row & {
  auctionId: string;
  /** "Class of 2027" or "Faculty & Staff" */
  name: string;
  /** "Seniors", "Juniors", ... */
  label: string;
  kind: TeamKind;
  /** Graduating year for grade teams, null for faculty. */
  classYear: number | null;
  sortOrder: number;
};

/** Icon keys map to lucide icons in components; keep this list short. */
export type SquadIcon = "ball" | "sparkle" | "star" | "music" | "trophy" | "users";

export type Squad = Row & {
  teamId: string;
  name: string;
  icon: SquadIcon;
  createdBy: string | null;
};

export type Student = Row & {
  auctionId: string;
  teamId: string;
  squadId: string | null;
  /** First name + last initial only, e.g. "Olivia S." */
  displayName: string;
  slug: string;
  userId: string | null;
};

export type Business = Row & {
  auctionId: string;
  name: string;
  logoPath: string | null;
  phone: string;
  address: string | null;
  dashboardToken: string;
  referredByStudentId: string | null;
};

export type ItemStatus = "pending" | "live" | "closed" | "paid" | "redeemed";

export type Item = Row & {
  auctionId: string;
  businessId: string;
  /** Student who secured the donation and gets the points. */
  studentId: string | null;
  title: string;
  description: string;
  photoPath: string | null;
  /** Icon key used for the placeholder art when there's no photo. */
  artIcon: ItemArt;
  retailValueCents: Cents;
  uses: number;
  validDays: number;
  startingBidCents: Cents;
  status: ItemStatus;
  currentBidCents: Cents | null;
  bidCount: number;
  leadingBidderId: string | null;
};

export type ItemArt = "pizza" | "burger" | "coffee" | "climb" | "guitar" | "flower" | "bowling" | "sail";

export type Bidder = Row & {
  userId: string | null;
  displayName: string;
  town: string;
  /** Never sent to the browser in Phase 2; mock only. */
  phone: string;
  smsOptIn: boolean;
};

/** Append-only. */
export type Bid = Row & {
  itemId: string;
  bidderId: string;
  amountCents: Cents;
};

export type PostFormat = "story" | "feed" | "tiktok";
export type PostStatus = "draft" | "pending" | "approved" | "rejected" | "posted";

export type Post = Row & {
  itemId: string;
  studentId: string;
  format: PostFormat;
  caption: string;
  status: PostStatus;
  reviewedBy: string | null;
  postedUrl: string | null;
  /** Where it appeared, e.g. "@bransonschool story". */
  channel: string | null;
  postedOn: ISODate | null;
  views: number;
};

export type ViewSource = "direct" | "post" | "qr";

/** Daily rollup that drives the business dashboard chart. */
export type ItemView = Row & {
  itemId: string;
  source: ViewSource;
  /** YYYY-MM-DD */
  viewedOn: string;
  count: number;
};

export type PaymentStatus = "pending" | "paid" | "lapsed";

export type Win = Row & {
  itemId: string;
  bidderId: string;
  amountCents: Cents;
  paymentStatus: PaymentStatus;
  everyorgChargeId: string | null;
  paidAt: ISODate | null;
  passToken: string;
  expiresOn: string;
  usesRemaining: number;
};

export type Redemption = Row & {
  winId: string;
  businessId: string;
  redeemedAt: ISODate;
};

export type NotificationKind = "verify_code" | "outbid" | "won_pay" | "paid_pass" | "business_dashboard";

export type Notification = Row & {
  kind: NotificationKind;
  to: string;
  payload: Record<string, unknown>;
  status: "queued" | "sent" | "failed";
  sentAt: ISODate | null;
};

/** Search result shape for the charity picker (matches what we'll map from Every.org). */
export type Nonprofit = {
  slug: string;
  name: string;
  ein: string;
  location: string;
  logoUrl: string | null;
};

/** Every table in one object: the mock store's shape. */
export type DB = {
  auctions: Auction[];
  teams: Team[];
  squads: Squad[];
  students: Student[];
  businesses: Business[];
  items: Item[];
  bidders: Bidder[];
  bids: Bid[];
  posts: Post[];
  itemViews: ItemView[];
  wins: Win[];
  redemptions: Redemption[];
  notifications: Notification[];
};
