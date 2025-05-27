export type ThemeName = 'purple' | 'pink' | 'dark' | 'green'

export interface AppTheme {
  name: ThemeName
  primary: string
  secondary: string
  background: string
  text: string
  button: string
  buttonText: string
  bottomNav: {
    background: string
    iconColor: string
    plusButtonBackground: string
    plusButtonIconColor: string
  }
  calendar: {
    background: string
    textColor: string
    todayColor: string
    arrowColor: string
    monthTextColor: string
    selectedDayBackground: string
    selectedDayTextColor: string
  }
}

export const themes: Record<ThemeName, AppTheme> = {
  purple: {
    name: 'purple',
    primary: '#6a3b7d',
    secondary: '#FFFFFF',
    background: '#F6E4F6',
    text: '#333333',
    button: '#a87cb3',
    buttonText: '#FFFFFF',
    bottomNav: {
      background: '#7e57c2',
      iconColor: '#FFFFFF',
      plusButtonBackground: '#ff69b4',
      plusButtonIconColor: '#FFFFFF'
    },
    calendar: {
      background: '#F6E4F6',
      textColor: '#333333',
      todayColor: '#a87cb3',
      arrowColor: '#a87cb3',
      monthTextColor: '#6a3b7d',
      selectedDayBackground: '#a87cb3',
      selectedDayTextColor: '#FFFFFF'
    }
  },
  pink: {
    name: 'pink',
    primary: '#E91E63',
    secondary: '#FFFFFF',
    background: '#FDE8EF',
    text: '#333333',
    button: '#F06292',
    buttonText: '#FFFFFF',
    bottomNav: {
      background: '#F06292',
      iconColor: '#FFFFFF',
      plusButtonBackground: '#6a3b7d',
      plusButtonIconColor: '#FFFFFF'
    },
    calendar: {
      background: '#FDE8EF',
      textColor: '#333333',
      todayColor: '#F06292',
      arrowColor: '#F06292',
      monthTextColor: '#E91E63',
      selectedDayBackground: '#F06292',
      selectedDayTextColor: '#FFFFFF'
    }
  },
  dark: {
    name: 'dark',
    primary: '#212121',
    secondary: '#FFFFFF',
    background: '#E0E0E0',
    text: '#333333',
    button: '#424242',
    buttonText: '#FFFFFF',
    bottomNav: {
      background: '#424242',
      iconColor: '#FFFFFF',
      plusButtonBackground: '#2E7D32',
      plusButtonIconColor: '#FFFFFF'
    },
    calendar: {
      background: '#E0E0E0',
      textColor: '#E91E63',
      todayColor: '#424242',
      arrowColor: '#424242',
      monthTextColor: '#212121',
      selectedDayBackground: '#d5d5d5',
      selectedDayTextColor: '#FFFFFF'
    }
  },
  green: {
    name: 'green',
    primary: '#2E7D32',
    secondary: '#FFFFFF',
    background: '#E8F5E9',
    text: '#333333',
    button: '#66BB6A',
    buttonText: '#FFFFFF',
    bottomNav: {
      background: '#388E3C',
      iconColor: '#FFFFFF',
      plusButtonBackground: '#2E7D32',
      plusButtonIconColor: '#FFFFFF'
    },
    calendar: {
      background: '#E8F5E9',
      textColor: '#333333',
      todayColor: '#66BB6A',
      arrowColor: '#66BB6A',
      monthTextColor: '#2E7D32',
      selectedDayBackground: '#66BB6A',
      selectedDayTextColor: '#FFFFFF'
    }
  }
}
