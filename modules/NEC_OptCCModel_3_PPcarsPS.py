# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PPcarsPS_module

Input ex:
     PPcarsPS( 800.0, 'CY',
     'C:\\Users\\User\\Desktop\\20191128_NEC_system\\Input_DATA\\TW_sites_address.xlsx',
     'C:\\Users\\User\\Desktop\\20191128_NEC_system\\Output_DATA_30_mins\\CY_DailyAssign_detail.xlsx')
"""

import numpy as np
import pandas as pd

def PPcarsPS(basic_Mileage, office_EGnm, Office_File, loc_DailyAssign_file):
    
    '''
    <input>
    basic_Mileage: float                         # private_car_monthly_basic_Mileage_km
    office: string
    Office_File: string [file path]              ### NEC_TWoffice_address
    loc_DailyAssign_file: string [file path]     ### loc_DailyAssign_detail
    
    
    
    <output>
    df_loc_PScost: dataframe (table), loc_PPcars_PriceSensitivity_cost 
    '''

    # loc PCcars_OptNumber_sensitivity
    #loc_CarNsens_data = np.zeros((7, 9))
    #loc_CarNsens_df = pd.DataFrame(loc_CarNsens_data, columns = ['AddPrice$2' , 'AddPrice$3', 'AddPrice$4' , 'AddPrice$5' , 'AddPrice$6', 'AddPrice$7', 'AddPrice$8', 'AddPrice$9', 'AddPrice$10'], index=['BasePrice$4', 'BasePrice$5', 'BasePrice$6' , 'BasePrice$7' , 'BasePrice$8', 'BasePrice$9', 'BasePrice$10'])
    # loc PCcars_OptCost_sensitivity
    loc_Costsens_data = np.zeros((7, 9))
    loc_Costsens_df = pd.DataFrame(loc_Costsens_data, columns = ['里程數外_單位補助$2' , '里程數外_單位補助$3', '里程數外_單位補助$4' , '里程數外_單位補助$5' , '里程數外_單位補助$6', '里程數外_單位補助$7', '里程數外_單位補助$8', '里程數外_單位補助$9', '里程數外_單位補助$10'], index=['里程數內_單位補助$4', '里程數內_單位補助$5', '里程數內_單位補助$6' , '里程數內_單位補助$7' , '里程數內_單位補助$8', '里程數內_單位補助$9', '里程數內_單位補助$10'])
    
    loc_DailyAssign_df = pd.read_excel(loc_DailyAssign_file)
    Office_Data = pd.read_excel(Office_File)
    office = Office_Data.loc[Office_Data.actgr == office_EGnm]['actgr_office'].item()
    CCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsNum'].item()          # loc_company_car_supply_num
    PCcars_num = Office_Data.loc[Office_Data.actgr_office == office]['actgr_PCcarsNum'].item()          # loc_private_car_supply_num
    CCcars_Rent = Office_Data.loc[Office_Data.actgr_office == office]['actgr_CCcarsRent'].item()        # loc_company_car_rental_$

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
                    loc_DailyAssign_carNow =  loc_DailyAssign_df.loc[(loc_DailyAssign_df['據點社車數量(輛)'] == CCcars_now),['服務日期','據點社車數量(輛)','據點社車累計行駛量(公里)','據點私車累計行駛量(公里)','據點計程車累計行駛量(公里)','社車當日油耗成本(元)','計程車當日使用成本(元)']]
                        
                    # variables setting
                    below_PCcarsFuel = base_price
                    upper_PCcarsFuel = add_price
        				
                    # CCcars & TXcars fuel cost
                    CCcars_total_Fuel = loc_DailyAssign_carNow['社車當日油耗成本(元)'].sum()
                    TXcars_total_Fuel = loc_DailyAssign_carNow['計程車當日使用成本(元)'].sum()
                        
                    # compute PCcars fuel
                    PCcars_total_Fuel = 0.0
                        
                    # daily run for one year
                    servDay_carNow = list(loc_DailyAssign_carNow['服務日期'])
                    for d in servDay_carNow: 
                        # reassign accu_Prvfuel every month
                        WorkDay = str(d)
                        if (WorkDay[-1] == "1" and WorkDay[-2] == "0") or (d == servDay_carNow[0]):
                            accu_PCcarsMileage = 0.0
                                
                        if PCcars_num != 0:
                            # loc for private cars
                            PCcars_mileage_workday = loc_DailyAssign_carNow['據點私車累計行駛量(公里)'][(loc_DailyAssign_carNow.服務日期 == d)].item()
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
                #min_CCcarnum = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['CCcars_num']
                min_CCcarCost = loc_CostAnaly_df.loc[loc_CostAnaly_df['TotalCost'].idxmin()]['TotalCost']
                below = "里程數內_單位補助$"+str(int(base_price))
                upper = "里程數外_單位補助$"+str(int(add_price))
                #loc_CarNsens_df.loc[ [below] ,[upper] ] = int(min_CCcarnum)
                loc_Costsens_df.loc[ [below] ,[upper] ] = '$ '+ format(int(min_CCcarCost), ',')
                
    return loc_Costsens_df.to_excel('C:\\Users\\User\\Desktop\\20191128_NEC_system\\Output_DATA_30_mins\\'+ office_EGnm +'_PriceSens_cost_TRY.xlsx', encoding='utf-8', index=True)