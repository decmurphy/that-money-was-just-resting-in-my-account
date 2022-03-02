export enum StrategyEventType {
    /*
        Pension Contributions
    */
    PENSION_EMPLOYER_CONTRIB = 'Employer Pension Contribution',
    PENSION_PERSONAL_CONTRIB = 'Personal Pension Contribution',
    // PENSION_MAX_PERSONAL_CONTRIB,

    /*
        Income
    */
    EMPLOYMENT_INCOME = 'Salary',
    ANCILLARY_INCOME = 'Ancillary Income',
    OTHER_INCOME = 'Other Income',

    /*
        Expenditures
    */
    MONTHLY_EXPENDITURE = 'Monthly Expenditure',
    YEARLY_EXPENDITURE = 'Annual Expenditure',

    /*
        Mortgage
    */
    MORTGAGE_APRC = 'Mortgage APRC',
    MORTGAGE_REPAYMENT = 'Mortgage Repayment',
    // /*
    //     Pension Contributions
    // */
    // CHANGE_PENSION_EMPLOYER_CONTRIB,
    // CHANGE_PENSION_PERSONAL_CONTRIB,
    // CHANGE_PENSION_MAX_PERSONAL_CONTRIB,

    // /*
    //     Income
    // */
    // CHANGE_EMPLOYMENT_INCOME,
    // ADD_ANCILLARY_INCOME,
    // REMOVE_ANCILLARY_INCOME,
    // CHANGE_ANCILLARY_INCOME,
    // ADD_OTHER_INCOME,
    // REMOVE_OTHER_INCOME,
    // CHANGE_OTHER_INCOME,

    // /*
    //     Expenditures
    // */
    // ADD_MONTHLY_EXPENDITURE,
    // REMOVE_MONTHLY_EXPENDITURE,
    // CHANGE_MONTHLY_EXPENDITURE,
    // ADD_YEARLY_EXPENDITURE,
    // REMOVE_YEARLY_EXPENDITURE,
    // CHANGE_YEARLY_EXPENDITURE,

    // /*
    //     Mortgage
    // */
    // CHANGE_MORTGAGE_APRC,
    // CHANGE_MORTGAGE_REPAYMENT,
}
