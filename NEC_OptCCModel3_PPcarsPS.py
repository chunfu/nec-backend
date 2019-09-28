# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PPcarsPS_module

Input ex:
    PathDist(4, 6, 800.0, 173700.0, '嘉義', 
    'C:\\Users\\User\\Desktop\\190822_NEC_system\\loc_DailyAssign_detail.xlsx')
"""

import numpy as np
import pandas as pd

# 敏感度分析按鈕
def PPcarsPS(CCcars_num, PCcars_num, basic_Mileage, CCcars_Rent, loc_DailyAssign_file):
    
    '''
    <input>
    CCcars_num: int                              # company_car_numbers
    PCcars_num: int                              # private_car_numbers
    basic_Mileage: float                         # private_car_monthly_basic_Mileage_km
    CCcars_Rent: float                           # company_car_yearly_rental_cost_$/car
    loc_DailyAssign_file: string [file path]     # df_loc_DailyAssign_detail
    
    <output>
    df_loc_PScost: dataframe (table), loc_PPcars_PriceSensitivity_cost // for display
    '''
    
    loc_DailyAssign_df = pd.read_excel(loc_DailyAssign_file)
    
    # loc PCcars_OptNumber_sensitivity
    loc_CarNsens_data = np.zeros((7, 9))
    loc_CarNsens_df = pd.DataFrame(loc_CarNsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])
    # loc PCcars_OptCost_sensitivity
    loc_Costsens_data = np.zeros((7, 9))
    df_loc_PScost = pd.DataFrame(loc_Costsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])

    ########## PCcars_sensitivity
    runCar_start = 0
    runCar_end = CCcars_num*2+1
    #for price change
    for base_price in range(4,11):
        for add_price in range(2,11):
            if base_price > add_price:
                # loc yearly Total_cost_analysis data
                loc_CostAnaly_data = np.zeros((runCar_end, 8))
                loc_CostAnaly_df = pd.DataFrame(loc_CostAnaly_data ,columns=['CCcars_num','FixedCost_rent','CCcars_fuel','PCcars_fuel','TXcars_fuel','VarCost_fuel','TotalCost','Taxi_prob'])
                loc_CostAnaly_df['CCcars_num'] = range(runCar_start, runCar_end)
        
                #for cars run
                for CCcars_now in range(runCar_start, runCar_end):
                    # daily assignment info
                    loc_DailyAssign_carNow =  loc_DailyAssign_df.loc[(loc_DailyAssign_df.CCcars_num == CCcars_now),['Work_date','CCcars_num','CCcars_mileage','PCcars_mileage','TXcars_mileage','CCcars_fuel','TXcars_fuel']]
                    
    				# variables setting
                    below_PCcarsFuel = base_price
                    upper_PCcarsFuel = add_price
    				
    				# CCcars & TXcars fuel cost
                    CCcars_total_Fuel = loc_DailyAssign_carNow['CCcars_fuel'].sum()
                    TXcars_total_Fuel = loc_DailyAssign_carNow['TXcars_fuel'].sum()
                    
    				# compute PCcars fuel
                    PCcars_total_Fuel = 0.0
                    
                    servDay = list(loc_DailyAssign_carNow['Work_date'])
                    for d in servDay: 
                        # reassign accu_Prvfuel every month
                        WorkDay = str(d)
                        if WorkDay[-1] == "1" and WorkDay[-2] == "0":
                            monthly_accu_PCcarsMileage = 0.0
                            
                        if PCcars_num != 0:
                            # loc for private cars
                            day_Avg_PCcarsMileage = loc_DailyAssign_carNow['PCcars_mileage'][(loc_DailyAssign_carNow.Work_date == d)] / PCcars_num
                            day_Avg_PCcarsMileage = day_Avg_PCcarsMileage.item()
                            monthly_accu_PCcarsMileage =  monthly_accu_PCcarsMileage + day_Avg_PCcarsMileage
                            if monthly_accu_PCcarsMileage <= basic_Mileage:
                                #below basic mileage
                                day_PCcarsFuel = (day_Avg_PCcarsMileage * below_PCcarsFuel) * PCcars_num 
                            else:
                                #over basic mileage
                                monthly_accu_PCcarsMileage_last = monthly_accu_PCcarsMileage - day_Avg_PCcarsMileage  #left_fuel for $6
                                if monthly_accu_PCcarsMileage_last < basic_Mileage and monthly_accu_PCcarsMileage > basic_Mileage:
                                    fuel_6 = ((basic_Mileage - monthly_accu_PCcarsMileage_last) * below_PCcarsFuel) * PCcars_num
                                    fuel_4 = ((monthly_accu_PCcarsMileage - basic_Mileage) * upper_PCcarsFuel) * PCcars_num
                                    day_PCcarsFuel = fuel_6 + fuel_4
                                else:
                                    day_PCcarsFuel = (day_Avg_PCcarsMileage * upper_PCcarsFuel) * PCcars_num
                        else:
                            # loc for no private cars
                            day_PCcarsFuel = 0.0
                        
                        PCcars_total_Fuel = PCcars_total_Fuel + day_PCcarsFuel
                        
                            
                    loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_Rent * CCcars_now
                    loc_CostAnaly_df['CCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel
                    loc_CostAnaly_df['PCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = PCcars_total_Fuel
                    loc_CostAnaly_df['TXcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = TXcars_total_Fuel
                    loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel + PCcars_total_Fuel + TXcars_total_Fuel
                    loc_CostAnaly_df['TotalCost'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] + loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)]
                
                #loc_CostAnaly_df.to_csv('C:\\Users\\User\Desktop\\NEC_CarModel\\190722_ExtOutput_PS_BXAX_Costdetail\\HC_CostInfo_B'+str(base_price)+'_A'+str(add_price)+'.csv')
        
                # record best cars_num and cost
                min_CCcar = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]["CCcars_num"]
                min_Cost = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]["TotalCost"]
                below = "BasePrice$"+str(int(below_PCcarsFuel))
                upper = "AddPrice$"+str(int(upper_PCcarsFuel))
                loc_CarNsens_df.loc[ [below] ,[upper] ] = int(min_CCcar)
                df_loc_PScost.loc[ [below] ,[upper] ] = round(min_Cost,2)
                
    return df_loc_PScost

