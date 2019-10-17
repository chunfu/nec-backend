# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PPcarsPS_module

Input ex:
     PPcarsPS(4, 3, 800.0, 173700.0,  
    'C:\\Users\\User\\Desktop\\190923_NEC_system\\Output_DATA_CYex\\loc_DailyAssign_detail.xlsx')
"""

import numpy as np
import pandas as pd

def PPcarsPS(CCcars_num, PCcars_num, basic_Mileage, CCcars_Rent, loc_DailyAssign_file):
    
    '''
    <input>
    CCcars_num: int                              # company_car_numbers
    PCcars_num: int                              # private_car_numbers
    basic_Mileage: float                         # private_car_monthly_basic_Mileage_km
    CCcars_Rent: float                           # company_car_yearly_rental_cost_$/car
    loc_DailyAssign_file: string [file path]     # df_loc_DailyAssign_detail
    
    <output>
    df_loc_PScost: dataframe (table), loc_PPcars_PriceSensitivity_cost 
    '''

    # loc PCcars_OptNumber_sensitivity
    loc_CarNsens_data = np.zeros((7, 9))
    loc_CarNsens_df = pd.DataFrame(loc_CarNsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])
    # loc PCcars_OptCost_sensitivity
    loc_Costsens_data = np.zeros((7, 9))
    loc_Costsens_df = pd.DataFrame(loc_Costsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])
    
    loc_DailyAssign_df = pd.read_excel(loc_DailyAssign_file)

    ########## PCcars_sensitivity
    runCar_start = 0
    runCar_end = CCcars_num*2+1
        
    for base_price in range(4,11):
        for add_price in range(2,11):
            if base_price > add_price:
                # loc yearly Total_cost_analysis data
                loc_CostAnaly_data = np.zeros((runCar_end, 7))
                loc_CostAnaly_df = pd.DataFrame(loc_CostAnaly_data ,columns=['CCcars_num','FixedCost_rent','CCcars_fuel','PCcars_fuel','TXcars_fuel','VarCost_fuel','TotalCost'])
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
                        
                    # daily run for one year
                    servDay_carNow = list(loc_DailyAssign_carNow['Work_date'])
                    for d in servDay_carNow: 
                        # reassign accu_Prvfuel every month
                        WorkDay = str(d)
                        if WorkDay[-1] == "1" and WorkDay[-2] == "0":
                            accu_PCcarsMileage = 0.0
                                
                        if PCcars_num != 0:
                            # loc for private cars
                            PCcars_mileage_workday = loc_DailyAssign_carNow['PCcars_mileage'][(loc_DailyAssign_carNow.Work_date == d)].item()
                            Avg_PCcarsMileage = PCcars_mileage_workday / PCcars_num
                            accu_PCcarsMileage =  accu_PCcarsMileage + Avg_PCcarsMileage
                            if accu_PCcarsMileage <= basic_Mileage:
                                #below basic mileage
                                PCcars_daily_Fuel = (Avg_PCcarsMileage * below_PCcarsFuel) * PCcars_num 
                            else:
                                #over basic mileage
                                accu_PCcarsMileage_last = accu_PCcarsMileage - Avg_PCcarsMileage  #left_fuel for $6
                                if accu_PCcarsMileage_last < basic_Mileage and accu_PCcarsMileage > basic_Mileage:
                                    fuel_6 = ((basic_Mileage - accu_PCcarsMileage_last) * below_PCcarsFuel) * PCcars_num
                                    fuel_4 = ((accu_PCcarsMileage - basic_Mileage) * upper_PCcarsFuel) * PCcars_num
                                    PCcars_daily_Fuel = fuel_6 + fuel_4
                                else:
                                    PCcars_daily_Fuel = (Avg_PCcarsMileage * upper_PCcarsFuel) * PCcars_num
                        else:
                            # loc for no private cars
                            PCcars_daily_Fuel = 0.0
                        
                        PCcars_total_Fuel = PCcars_total_Fuel + PCcars_daily_Fuel
                            
                                
                    loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_Rent * CCcars_now
                    loc_CostAnaly_df['CCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel
                    loc_CostAnaly_df['PCcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = PCcars_total_Fuel
                    loc_CostAnaly_df['TXcars_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = TXcars_total_Fuel
                    loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = CCcars_total_Fuel + PCcars_total_Fuel + TXcars_total_Fuel
                    loc_CostAnaly_df['TotalCost'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] = loc_CostAnaly_df['FixedCost_rent'][(loc_CostAnaly_df.CCcars_num == CCcars_now)] + loc_CostAnaly_df['VarCost_fuel'][(loc_CostAnaly_df.CCcars_num == CCcars_now)]
                    
                    #loc_CostAnaly_df.to_csv('C:\\Users\\User\Desktop\\NEC_CarModel\\190722_ExtOutput_PS_BXAX_Costdetail\\HC_CostInfo_B'+str(base_price)+'_A'+str(add_price)+'.csv')
            
                # record best cars_num and cost
                min_CCcarnum = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['CCcars_num']
                min_CCcarCost = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['TotalCost']
                below = "BasePrice$"+str(int(base_price))
                upper = "AddPrice$"+str(int(add_price))
                loc_CarNsens_df.loc[ [below] ,[upper] ] = int(min_CCcarnum)
                loc_Costsens_df.loc[ [below] ,[upper] ] = round(min_CCcarCost,2)
                
    return loc_Costsens_df.to_excel('loc_Costsens.xlsx', encoding='utf-8', index=False)