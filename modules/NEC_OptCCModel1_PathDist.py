# -*- coding: utf-8 -*-
"""
Created on  Sep  

@author: CocoLiao

Topic: NEC_system_PathDist_module

Input ex:
    PathDist('C:\\Users\\User\\Desktop\\190822_NEC_system\\2018_MRDATA_original.xlsx',
    'C:\\Users\\User\\Desktop\\190923_NEC_system\\Input_DATA\\2018_workerDATA.xlsx',
    'C:\\Users\\User\\Desktop\\190923_NEC_system\\Input_DATA\\NEC_TWoffice_address.xlsx',
    '嘉義')
"""

# packages import 
import pandas as pd
import numpy as np
import googlemaps 

def PathDist(Service_File, Worker_File, Office_File, office):
    
    '''
    <input>
    Service_File: string [file path]     # NEC_MRDATA_original
    Worker_File: string [file path]      # NEC_workerDATA
    Office_File: string [file path]      # NEC_TWoffice_address
    office: string
    
    <output>
    df_loc_PathDist_detail: dataframe (table), original MRDATA resort with path labeled
    df_loc_PathDist_analy: dataframe (table), each uniquePath info with Out_date, Path_ID/order, MoveDist_GO/BACK/TOL, Begin/End_time columns
    '''
    
    # read original MR_DATA files
    Service_Data = pd.read_excel(Service_File)
    Worker_Data = pd.read_excel(Worker_File)
    Office_Data = pd.read_excel(Office_File)
    
    # match serciceDATA and workerDATA
    Worker_Data = Worker_Data.drop(['person_nm', 'actgr_nm'], axis = 1) 
    Data = pd.merge(Service_Data, Worker_Data, on='case_no')
    
    # office select and resort --> PathData
    office_EGnm = Office_Data.loc[Office_Data.actgr_office == office]['actgr'].item()
    office_addr = Office_Data.loc[Office_Data.actgr_office == office]['actgr_address'].item()
    office_nm = Office_Data.loc[Office_Data.actgr_office == office]['actgr_name'].item()
    loc_Data =  Data[Data['actgr_nm'] == office_nm]
    loc_Data['out_day'] = (pd.to_datetime(loc_Data.out_dt)).dt.date
    loc_Data['out_dt_secs'] = pd.to_timedelta(loc_Data['out_dt']).dt.total_seconds()
    loc_Data['back_dt_secs'] = pd.to_timedelta(loc_Data['back_dt']).dt.total_seconds()
    df_loc_PathDist_detail = loc_Data.sort_values(['out_day','person_id','out_dt_secs'], ascending=[True,True,True])
    
    # label the path
    Service_count = df_loc_PathDist_detail.shape[0]
    loc_OutDays = pd.to_datetime(df_loc_PathDist_detail['out_day'], format = '%Y-%m-%d')
    loc_Days = loc_OutDays.dt.strftime('%Y%m%d').tolist()
    
    Daily_PathID = list()
    Daily_PathOrder = list()
    UniquePathID = list()
    
    for r in range(0, Service_count):
        #print('round'+str(r))
        if (r == 0) or (df_loc_PathDist_detail.iloc[r-1]['out_day'] != df_loc_PathDist_detail.iloc[r]['out_day']):
            path_ID = 1
            path_order = 1
            Daily_PathID.append(path_ID)
            Daily_PathOrder.append(path_order)
        else:
            if (df_loc_PathDist_detail.iloc[r-1]['next_place'] == '返社') or (df_loc_PathDist_detail.iloc[r-1]['person_id'] != df_loc_PathDist_detail.iloc[r]['person_id']):
                path_ID = path_ID + 1
                path_order = 1
                Daily_PathID.append(path_ID)
                Daily_PathOrder.append(path_order)
            else:
                path_ID = path_ID
                path_order = path_order + 1
                Daily_PathID.append(path_ID)
                Daily_PathOrder.append(path_order)
        UniqueID =  '_' .join([loc_Days[r], str(path_ID)])
        UniquePathID.append(UniqueID)
        
    df_loc_PathDist_detail['Daily_PathID'] = Daily_PathID
    df_loc_PathDist_detail['Daily_PathOrder'] = Daily_PathOrder
    df_loc_PathDist_detail['Unique_PathID'] = UniquePathID
    
    # get Google maps distance
    gmaps = googlemaps.Client(key='AIzaSyDFkfki70KWhABw5gMuqRRfkNwsyv7x6Ak')
    loc_PathID = list(set(df_loc_PathDist_detail['Unique_PathID']))
    loc_PathID.sort()
    Path_count = len(loc_PathID)
    
    # prepare Pathanalysis dataframe
    loc_PathAnalysis = np.zeros((Path_count, 11))
    df_loc_PathDist_analy = pd.DataFrame(loc_PathAnalysis, columns = ['Out_Day', 'Order' , 'Unique_PathID', 'PathGo_MoveDist' , 'PathBack_MoveDist' , 'PathTol_MoveDist(m)' , 'PathTol_MoveDist(km)' , 'Begin_Time(normal)' , 'End_Time(normal)' , 'Begin_Time(secs)' , 'End_Time(secs)'])
    df_loc_PathDist_analy['Unique_PathID'] = loc_PathID
    temp = df_loc_PathDist_analy['Unique_PathID'].str.split("_", n = 1, expand = True) 
    df_loc_PathDist_analy['Out_Day'] = temp[0]
    df_loc_PathDist_analy['Order'] = temp[1].astype(int)
    
    
    
    ### df_loc_PathDist_detail_add_columns
    GoMove_Dist = list()
    BackMove_Dist = list()
    
    
    for i in range(0, Path_count):
        print('round_i'+str(i))
        EachPath_Data =  df_loc_PathDist_detail.loc[df_loc_PathDist_detail['Unique_PathID'] == loc_PathID[i]]
        EachPath_count = EachPath_Data.shape[0]
        EachPath_GoDist_accu = 0
        EachPath_BackDist_accu = 0
        
        for j in range(0,EachPath_count):
            print('__round_j'+str(j))
            # Go moving distance
            if j == 0:
                # Requires cities name 
                origins_Goaddr = office_addr
                destination_GOaddr =EachPath_Data.iloc[j]['comp_address']
                GO_Dist = gmaps.distance_matrix(origins_Goaddr, destination_GOaddr, mode = 'driving')['rows'][0]['elements'][0]['distance']['value']
                GoMove_Dist.append(GO_Dist)
                EachPath_GoDist_accu = EachPath_GoDist_accu + GO_Dist
                
            else:
                origins_Goaddr = EachPath_Data.iloc[j-1]['comp_address']
                destination_GOaddr = EachPath_Data.iloc[j]['comp_address']
                GO_Dist = gmaps.distance_matrix(origins_Goaddr,destination_GOaddr, mode = 'driving')['rows'][0]['elements'][0]['distance']['value']
                GoMove_Dist.append(GO_Dist)
                EachPath_GoDist_accu = EachPath_GoDist_accu + GO_Dist
                
            # Back moving distance
            if j == (EachPath_count-1):
                origins_BACKaddr =  EachPath_Data.iloc[j]['comp_address']
                destination_BACKaddr = office_addr   # office addr
                BACK_Dist = gmaps.distance_matrix(origins_BACKaddr, destination_BACKaddr, mode = 'driving')['rows'][0]['elements'][0]['distance']['value']
                BackMove_Dist.append(BACK_Dist)
                EachPath_BackDist_accu = EachPath_BackDist_accu + BACK_Dist
            else:
                BACK_Dist = 0
                BackMove_Dist.append(BACK_Dist)
                EachPath_BackDist_accu = EachPath_BackDist_accu + BACK_Dist     
    
        df_loc_PathDist_analy.loc[i,'PathGo_MoveDist'] = EachPath_GoDist_accu
        df_loc_PathDist_analy.loc[i,'PathBack_MoveDist'] = EachPath_BackDist_accu
        df_loc_PathDist_analy.loc[i,'PathTol_MoveDist(m)'] = EachPath_GoDist_accu + EachPath_BackDist_accu
        df_loc_PathDist_analy.loc[i,'PathTol_MoveDist(km)'] = (EachPath_GoDist_accu + EachPath_BackDist_accu)/1000
        df_loc_PathDist_analy.loc[i,'Begin_Time(normal)'] = EachPath_Data.iloc[0]['out_dt']
        df_loc_PathDist_analy.loc[i,'End_Time(normal)'] = EachPath_Data.iloc[(EachPath_count-1)]['back_dt']
        df_loc_PathDist_analy.loc[i,'Begin_Time(secs)'] =  EachPath_Data.iloc[0]['out_dt_secs']
        df_loc_PathDist_analy.loc[i,'End_Time(secs)'] = EachPath_Data.iloc[(EachPath_count-1)]['back_dt_secs']
    
    
    df_loc_PathDist_detail['GoMove_Dist'] = GoMove_Dist
    df_loc_PathDist_detail['BackMove_Dist'] = BackMove_Dist
    df_loc_PathDist_analy = df_loc_PathDist_analy.sort_values(['Out_Day','Order'], ascending=[True,True])
    
    return df_loc_PathDist_detail.to_excel('../docs/loc_PathDist_detail.xlsx', encoding='utf-8', index=False), df_loc_PathDist_analy.to_excel('../docs/loc_PathDist_analy.xlsx', encoding='utf-8', index=False)
    
    