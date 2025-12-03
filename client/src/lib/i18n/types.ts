/**
 * Type definitions for i18n system
 */

export type Language = 'en' | 'de';

export interface TranslationParams {
  [key: string]: string | number;
}

export interface PluralTranslation {
  singular: string;
  plural: string;
}

/**
 * Type-safe translation keys structure
 * This ensures all translation keys are properly typed
 */
export type TranslationKeys = {
  nav: {
    socialEnterprises: string;
    aboutUs: string;
    contact: string;
    joinUs: string;
    logIn: string;
    joinWaitlist: string;
    dashboard: string;
    rewards: string;
    logOut: string;
    loggingOut: string;
    asSocialEnterprise: string;
    asSocialEnterpriseDescription: string;
    viewFullImpactDashboard: string;
    redeemRewards: string;
    progressToUnlockRewards: string;
    ipToUnlockRewards: string;
  };
  home: {
    heroTitle: string;
    heroTitlePrefix: string; // For German: empty, for English: "Supporting real impact made"
    heroTitleSuffix: string; // For German: "unterstützen", for English: empty
    heroRotatingWords: string[]; // Dynamic rotating words
    heroSubtitle: string;
    joinWaitlist: string;
    joinWaitlistShort: string;
    seeSocialEnterprises: string;
    seeSocialEnterprisesShort: string;
    infoBar1: string;
    infoBar2: string;
    infoBar3: string;
    impactLabel: string;
    rewardLabel: string;
  };
  projects: {
    title: string;
    filterLabel: string;
    pageTitle: string;
    pageDescription: string;
    pageSubDescription: string;
    seoTitle: string;
    seoDescription: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    searchPlaceholder: string;
    allCategories: string;
    allCountries: string;
    filterButton: string;
    resetButton: string;
    viewProject: string;
    noProjectsFound: string;
    noProjectsFoundDescription: string;
    applyWithMyProject: string;
    nominateProject: string;
  };
  projectDetail: {
    whyWeBackThem: string;
    whyWeSelected: string;
    backToProjects: string;
    projectNotFound: string;
    projectNotFoundDescription: string;
    supportProject: string;
    englishContentLabel: string;
    aboutSocialEnterprise: string;
    impactAchievements: string;
    howDonationUsed: string;
    projectSnapshot: string;
    impactMultiplier: string;
    learnAboutImpactMultiplier: string;
    earnImpactPoints: string;
    story: string;
    impact: string;
    impactCreatedSoFar: string;
    readyToMakeDifference: string;
    aboutChangemaker: string;
    impactPoints: string;
    learnAboutImpactPoints: string;
    supportChangeEarnPoints: string;
    impactPointsYoullEarn: string;
    impactPointsRedeemable: string;
    impactPointsTableHeader: string;
    readFullStory: string;
    about: string;
    changemakers: string;
    theChangemaker: string;
    makeAnImpact: string;
    carefullyVetted: string;
    supportGoesToInitiative: string;
    earnPointsRedeemable: string;
    backedBy: string;
    category: string;
    location: string;
    founder: string;
    supportThisProject: string;
    trustedByLeadingOrganizations: string;
    trustedByDescription: string;
    recognizedInPress: string;
    coFounder: string;
    andMore: string;
    chooseAmountDonate: string;
    tapToLearnMore: string;
    learnMoreAboutTeam: string;
    readArticle: string;
    founderBioFallback: string;
    teamBehindFallback1: string;
    teamBehindFallback2: string;
    teamBehindFallback3: string;
    share: string;
    shareThisProject: string;
    shareViaEmail: string;
    shareOnFacebook: string;
    shareOnInstagram: string;
    getInTouch: string;
    earnImpactPointsDescription: string;
    donation: string;
    points: string;
    bonusPoints: string;
    impactMultiplierDescription: string;
    orEnterCustomAmount: string;
    visitBacker: string;
    yourSupport: string;
  };
  dashboard: {
    title: string;
    welcomeBack: string;
    receivedImpactPoints: string;
    supportToUnlock: string;
    supportAProject: string;
    getRewards: string;
    socialEnterprises: string;
    socialEnterprisesSupported: string;
    highlightedSocialEnterprises: string;
    noFeaturedAvailable: string;
    noStartupsSupported: string;
    loadMore: string;
    rewards: string;
    impactPoints: string;
    startupsSupported: string;
    totalImpactCreated: string;
    errorLoadingData: string;
    donations: string;
    notAvailable: string;
    welcomeTitle: string;
    progressToReward: string;
    noFeaturedRewards: string;
    noRewardsRedeemed: string;
    sustainableRewardsUnlocked: string;
    featuredRewards: string;
    exploreVerifiedInnovators: string;
    yourImpactOverTime: string;
    impactCreated: string;
    supportAmount: string;
    comingSoon: string;
    personalImpactDashboard: string;
    getNotifiedWhenReady: string;
  };
  rewards: {
    title: string;
    count: PluralTranslation;
    redeem: string;
    // Add more as needed
  };
  faq: {
    title: string;
    subtitle: string;
    seoTitle: string;
    seoDescription: string;
    stillHaveQuestions: string;
    contactSupportText: string;
    contactSupport: string;
    questions: {
      whySupportSocialEnterprises: {
        question: string;
        answer: string;
      };
      howMuchDoesDopayaTake: {
        question: string;
        answer: string;
      };
      howDoesDopayaEnsure: {
        question: string;
        answer: string;
      };
      howCanSocialEnterpriseJoin: {
        question: string;
        answer: string;
        applyHere: string;
      };
      howDoBrandsCollaborate: {
        question: string;
        answer: string;
        partnerWithUs: string;
      };
      isThereCostForBrands: {
        question: string;
        answer: string;
      };
      isThereCostForSocialEnterprises: {
        question: string;
        answer: string;
      };
      canIChooseContribution: {
        question: string;
        answer: string;
      };
      whatKindOfRewards: {
        question: string;
        answer: string;
      };
      areContributionsTaxDeductible: {
        question: string;
        answer: string;
      };
    };
  };
  auth: {
    welcomeToDopaya: string;
    login: string;
    register: string;
    signUp: string;
    signIn: string;
    createAccount: string;
    createYourAccount: string;
    welcomeBack: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    enterYourEmail: string;
    enterYourPassword: string;
    enterCredentials: string;
    joinDopayaToStart: string;
    continueWithGoogle: string;
    orContinueWithEmail: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    signUpHere: string;
    signInHere: string;
    placeholders: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    validation: {
      validEmailRequired: string;
      passwordRequired: string;
      passwordMinLength: string;
      firstNameRequired: string;
      lastNameRequired: string;
    };
    errors: {
      loginFailed: string;
      registrationFailed: string;
      googleSignInFailed: string;
      emailSignInFailed: string;
      checkEmailToConfirm: string;
    };
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    close: string;
  };
  footer: {
    stayUpdated: string;
    newsletterDescription: string;
    enterEmail: string;
    subscribe: string;
    thankYouSubscribing: string;
    tagline: string;
    community: string;
    createImpact: string;
    legal: string;
    aboutUs: string;
    socialEnterprisePartners: string;
    brandPartners: string;
    contactUs: string;
    faq: string;
    socialEnterprises: string;
    privacyPolicy: string;
    cookiePolicy: string;
    eligibilityGuidelines: string;
    copyright: string;
    madeWithLove: string;
    supportingChange: string;
  };
  seo: {
    // Add SEO translations
  };
  images: {
    heroImage: string;
    projectImage: string;
    rewardImage: string;
    founderImage: string;
    logoAlt: string;
  };
  about: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    nameMeaning: string;
    nameOrigin: string;
    nameDo: string;
    nameDoDescription: string;
    nameUpaya: string;
    nameUpayaDescription: string;
    problemTitle: string;
    problemText1: string;
    problemText2: string;
    problemText3: string;
    problemText4: string;
    visionTitle: string;
    visionText: string;
    approachTitle: string;
    transparentTitle: string;
    transparentDescription: string;
    builtAroundPeopleTitle: string;
    builtAroundPeopleDescription: string;
    givingEarningTitle: string;
    givingEarningDescription: string;
    teamTitle: string;
    teamSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    changemakersInAction: string;
    spectrumTitle: string;
    spectrumSubtitle: string;
    spectrumNGO: string;
    spectrumNGOShort: string;
    spectrumSocialEnterprises: string;
    spectrumForProfit: string;
    spectrumNotForProfit: string;
    spectrumForProfitLabel: string;
    spectrumExamples: string;
    spectrumNGOExplanation: string;
    spectrumImpactDrivenExplanation: string;
    spectrumForProfitExplanation: string;
  };
  contact: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    title: string;
    subtitle: string;
    emailLabel: string;
    whatsappLabel: string;
    calendlyLabel: string;
    calendlyButton: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailFieldLabel: string;
    messageLabel: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submitButton: string;
    messageSentTitle: string;
    messageSentDescription: string;
    firstNameRequired: string;
    lastNameRequired: string;
    emailInvalid: string;
    messageMinLength: string;
  };
  eligibility: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    title: string;
    subtitle: string;
    applyNow: string;
    selectionCriteriaTitle: string;
    selectionCriteriaSubtitle: string;
    criteria: {
      businessModel: {
        title: string;
        description: string;
      };
      organizationType: {
        title: string;
        description: string;
      };
      impactOrientation: {
        title: string;
        description: string;
      };
      founderProfile: {
        title: string;
        description: string;
      };
      useOfFunds: {
        title: string;
        description: string;
      };
      sector: {
        title: string;
        description: string;
      };
      region: {
        title: string;
        description: string;
      };
      efficiency: {
        title: string;
        description: string;
      };
    };
    keyRequirementsTitle: string;
    keyRequirementsSubtitle: string;
    whatWeAreLookingFor: string;
    currentLimitations: string;
    lookingFor: {
      earlyStage: string;
      revenueGenerating: string;
      quantifiableImpact: string;
      missionDriven: string;
    };
    limitations: {
      traditionalNGOs: string;
      noMeasurableImpact: string;
      unregistered: string;
    };
    ctaTitle: string;
    ctaDescription: string;
    submitApplication: string;
    questionsTitle: string;
    questionsDescription: string;
    contactForGuidance: string;
  };
  support: {
    backToProject: string;
    supportPreview: string;
    previewDescription: string;
    suggested: string;
    amountMinimum: string;
    congratulations: string;
    impactPointsEarned: string;
    createRealImpact: string;
    goesToProject: string;
    aboutImpaktera: string;
    impakteraDescription: string;
    tipDopaya: string;
    tipDescription: string;
    impactFirst: string;
    enterCustomTip: string;
    useSliderInstead: string;
    paymentMethod: string;
    creditDebitCard: string;
    dontDisplayName: string;
    whyShowNames: string;
    signUpForUpdates: string;
    yourSupportAmount: string;
    tipToDopaya: string;
    totalDueToday: string;
    continue: string;
    termsAgreement: string;
    projectNotFound: string;
    projectNotFoundDescription: string;
    redirecting: string;
  };
    socialEnterprises: {
      seoTitle: string;
      seoDescription: string;
      seoKeywords: string;
      heroTitle: string;
      heroSubtitle: string;
      startApplication: string;
      freeForever: string;
      simpleOnboarding: string;
      limitedPilotAccess: string;
      problemTitle: string;
      problemDescription: string;
      benefitsTitle: string;
      processTitle: string;
      processStep1: string;
      processStep2: string;
      processStep3: string;
      processStep4: string;
      faqTitle: string;
      faqSubtitle: string;
      ctaTitle: string;
      ctaSubtitle: string;
      joinCommunity: string;
      applyNow: string;
      processSectionTitle: string;
      processSectionSubtitle: string;
      step1Description: string;
      step2Description: string;
      step3Description: string;
      step4Description: string;
      benefit1Title: string;
      benefit1Description: string;
      benefit2Title: string;
      benefit2Description: string;
      benefit3Title: string;
      benefit3Description: string;
      sectorAgnostic: string;
      allCausesWelcome: string;
      freeOfCost: string;
      noPlatformFees: string;
      applicationOnly: string;
      simpleProcess: string;
      pilotProgramTitle: string;
      pilotProgramDescription: string;
      applyForPilotProgram: string;
      checkEligibility: string;
      pilotProgramBenefits: string;
      faq1Question: string;
      faq1Answer: string;
      faq2Question: string;
      faq2Answer: string;
      faq3Question: string;
      faq3Answer: string;
      faq4Question: string;
      faq4Answer: string;
      faq5Question: string;
      faq5Answer: string;
      faq6Question: string;
      faq6Answer: string;
      faq7Question: string;
      faq7Answer: string;
      stickyCtaText: string;
      timelineNowTitle: string;
      timelineNowHeading: string;
      timelineNowDescription: string;
      timelineNowJoinCommunity: string;
      timelineSoonTitle: string;
      timelineSoonHeading: string;
      timelineSoonDescription: string;
      timelineSoonVcFunding: string;
      timelineSoonVcDescription: string;
      timelineSoonGrantApplications: string;
      timelineSoonGrantDescription: string;
      timelineSoonCorporatePartnership: string;
      timelineSoonCorporateDescription: string;
      timelineSoonGovernmentGrants: string;
      timelineSoonGovernmentDescription: string;
      timelineFutureTitle: string;
      timelineFutureHeading: string;
      timelineFutureDescription: string;
      timelineLoadingProjects: string;
      eligibilityTitle: string;
      eligibilitySubtitle: string;
      eligibilityBusinessModel: string;
      eligibilityBusinessModelDesc: string;
      eligibilityOrganizationType: string;
      eligibilityOrganizationTypeDesc: string;
      eligibilityImpactOrientation: string;
      eligibilityImpactOrientationDesc: string;
      eligibilityFounderProfile: string;
      eligibilityFounderProfileDesc: string;
      eligibilityUseOfFunds: string;
      eligibilityUseOfFundsDesc: string;
      eligibilitySector: string;
      eligibilitySectorDesc: string;
      eligibilityRegion: string;
      eligibilityRegionDesc: string;
      eligibilityEfficiency: string;
      eligibilityEfficiencyDesc: string;
      contactTitle: string;
      contactSubtitle: string;
      contactAboutMe: string;
      contactAboutMeDescription: string;
      contactGetInTouch: string;
      contactEmail: string;
      contactInstagram: string;
      contactQuickChat: string;
      contactScheduleCall: string;
      contactPatrickAlt: string;
      finalCtaTitle: string;
      finalCtaSubtitle: string;
      timelineSectionTitle: string;
      timelineSectionSubtitle: string;
    };
    thankYou: {
      title: string;
      thankYouMessage: string;
      feedbackDescription: string;
      platformName: string;
      platformDescription: string;
      givingDescription: string;
      seeYouMessage: string;
      joinWaitlist: string;
      learnMore: string;
      impactProjectAlt: string;
    };
  rewardsPage: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    title: string;
    subtitle: string;
    unlockBannerTitle: string;
    unlockBannerDescription: string;
    lockedStateTitle: string;
    lockedStateDescription: string;
    lockedStateButton: string;
    sampleRewardsTitle: string;
    sampleRewardsNote: string;
    availableNow: string;
    comingSoon: string;
    searchPlaceholder: string;
    featuredBrandsTitle: string;
    featuredBrandsSubtitle: string;
    noBrandsFound: string;
    noBrandsFoundSubtitle: string;
    sustainableBrand: string;
    discoverBrand: string;
    getRewardsWithPoints: string;
    startingFrom: string;
    availableRewardsTitle: string;
    availableRewardsSubtitle: string;
    requires: string;
    points: string;
    value: string;
    brand: string;
    unlockReward: string;
    noRewardsMatch: string;
    tryAdjustingSearch: string;
    clearSearch: string;
    authenticationRequired: string;
    pleaseLogIn: string;
    rewardRedeemed: string;
    successfullyRedeemed: string;
    impactPoints: string;
    category: string;
    allBrands: string;
    allCategories: string;
    allPoints: string;
    dopayasPick: string;
    dopayasPickActive: string;
    activeFilters: string;
    searchFilter: string;
    brandFilter: string;
    categoryFilter: string;
    pointsFilter: string;
    removeFilter: string;
    aboutBrand: string;
    sustainableBrandDescription: string;
    visitWebsite: string;
    unlockRewardButton: string;
    confirmRedeem: string;
    confirmRedeemDescription: string;
    cancel: string;
    redeem: string;
    rewardUnlocked: string;
    promoCode: string;
    copyCode: string;
    codeCopied: string;
    redeemInstructions: string;
    redeemLink: string;
    close: string;
    insufficientPoints: string;
    insufficientPointsDescription: string;
    viewOtherRewards: string;
    generateImpactEarnMore: string;
    confirmUnlockDescription: string;
    yes: string;
    no: string;
    rewardUnlockedTitle: string;
    promoCodeReady: string;
    yourPromoCode: string;
    codeCopiedTitle: string;
    codeCopiedDescription: string;
    copyFailed: string;
    copyFailedDescription: string;
    importantNote: string;
    codeCopiedToClipboard: string;
    shopNow: string;
    loadingRewardDetails: string;
    viewMore: string;
    viewBrandRewards: string;
  };
  homeSections: {
    caseStudy: {
      title: string;
      subtitle: string;
      seeImpact: string;
      support: string;
      withProject: string;
      andHelp: string;
      earn: string;
      impactPoints: string;
      supportThisProject: string;
      exploreAllProjects: string;
      sdgBell: {
        title: string;
        subtitle: string;
        footer: string;
        reasons: Array<{
          title: string;
          description: string;
        }>;
      };
    };
    partnerShowcase: {
      title: string;
      subtitle: string;
      popularRewards: string;
      popularRewardsSubtitle: string;
    };
    impactDashboard: {
      title: string;
      subtitle: string;
      individualDashboard: {
        title: string;
        content: string;
      };
      impactRanking: {
        title: string;
        content: string;
      };
      impactTracking: {
        step: string;
        title: string;
        content: string;
      };
      foundingMember: {
        step: string;
        title: string;
        content: string;
      };
      foundingMemberBenefits: string;
      getLifetimeAccess: string;
      joinNowDescription: string;
      joinWaitlist: string;
      oneDashboard: string;
      trackEveryDollar: string;
      trackYourImpact: string;
      everythingYouNeed: string;
      readyToAmplify: string;
      joinAsFoundingMember: string;
    };
    institutionalProof: {
      title: string;
      subtitle: string;
      errorLoading: string;
      noBackersAvailable: string;
      tapToLearnMore: string;
      supportedProjects: string;
      noProjectsFound: string;
      visit: string;
    };
    faq: {
      title: string;
      subtitle: string;
      questions: Array<{
        question: string;
        answer: string;
      }>;
    };
    foundingMemberCTA: {
      title: string;
      subtitle: string;
      immediateBenefits: string;
      communityAccess: string;
      benefit1: string;
      benefit2: string;
      benefit3: string;
      benefit4: string;
      benefit5: string;
      benefit6: string;
      joinWaitlist: string;
      limitedAvailability: string;
    };
  };
};

