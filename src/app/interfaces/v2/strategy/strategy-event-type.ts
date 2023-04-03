export enum StrategyEventType {
    /*
        Pension Contributions
    */
    // PENSION_EMPLOYER_CONTRIB = 'Employer Pension Contribution',
    // PENSION_PERSONAL_CONTRIB = 'Personal Pension Contribution',

    /*
        Income
    */
    EMPLOYMENT_INCOME = 'Salary',
    // ANCILLARY_INCOME = 'Ancillary Income',
    // OTHER_INCOME = 'Other Income',

    /*
        Expenditures
    */
    MONTHLY_EXPENDITURE = 'Monthly Expenditure',
    YEARLY_EXPENDITURE = 'Annual Expenditure',
    ONCE_OFF_EXPENDITURE = 'Once Off Expenditure',

    /*
        Mortgage
    */
    MORTGAGE_APRC = 'Mortgage APRC',
    MORTGAGE_REPAYMENT = 'Mortgage Repayment',
    MORTGAGE_LUMP_SUM = 'Mortgage Lump Sum'
}
