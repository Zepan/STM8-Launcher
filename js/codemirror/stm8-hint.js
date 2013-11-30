(function() {
  "use strict";

  var WORD = /[\w$]+/, RANGE = 500;
  var cKeywords = ("auto break case char const continue default do double else enum extern float for goto if int long " +
                  "register return short signed sizeof static struct switch typedef union unsigned void volatile while").split(" ");
  var libKeywords =("ADC1_AWDChannelConfig ADC1_ClearFlag ADC1_ClearITPendingBit ADC1_Cmd ADC1_ConversionConfig ADC1_DataBufferCmd ADC1_DeInit ADC1_ExternalTriggerConfig ADC1_GetAWDChannelStatus ADC1_GetBufferValue ADC1_GetConversionValue ADC1_GetFlagStatus ADC1_GetITStatus ADC1_Init ADC1_ITConfig ADC1_PrescalerConfig ADC1_ScanModeCmd ADC1_SchmittTriggerConfig ADC1_SetHighThreshold ADC1_SetLowThreshold ADC1_StartConversion ADC2_ClearFlag ADC2_ClearITPendingBit ADC2_Cmd ADC2_ConversionConfig ADC2_DeInit ADC2_ExternalTriggerConfig ADC2_GetConversionValue ADC2_GetFlagStatus ADC2_GetITStatus ADC2_Init ADC2_ITConfig ADC2_PrescalerConfig ADC2_SchmittTriggerConfig ADC2_StartConversion AWU_Cmd AWU_DeInit AWU_GetFlagStatus AWU_IdleModeEnable AWU_Init AWU_LSICalibrationConfig BEEP_Cmd BEEP_DeInit BEEP_Init BEEP_LSICalibrationConfig CAN_CancelTransmit CAN_ClearFlag CAN_ClearITPendingBit CAN_DeInit CAN_FIFORelease CAN_FilterInit CAN_GetFlagStatus CAN_GetITStatus CAN_GetLastErrorCode CAN_GetMessageTimeStamp CAN_GetReceivedData CAN_GetReceivedDLC CAN_GetReceivedFMI CAN_GetReceivedId CAN_GetReceivedIDE CAN_GetReceivedRTR CAN_GetSelectedPage CAN_Init CAN_ITConfig CAN_MessagePending CAN_OperatingModeRequest CAN_Receive CAN_SelectPage CAN_Sleep CAN_ST7CompatibilityCmd CAN_Transmit CAN_TransmitStatus CAN_TTComModeCmd CAN_WakeUp CheckITStatus CLK_AdjustHSICalibrationValue CLK_CCOCmd CLK_CCOConfig CLK_ClearITPendingBit CLK_ClockSecuritySystemEnable CLK_ClockSwitchCmd CLK_ClockSwitchConfig CLK_DeInit CLK_FastHaltWakeUpCmd CLK_GetClockFreq CLK_GetFlagStatus CLK_GetITStatus CLK_GetSYSCLKSource CLK_HSECmd CLK_HSICmd CLK_HSIPrescalerConfig CLK_ITConfig CLK_LSICmd CLK_PeripheralClockConfig CLK_SlowActiveHaltWakeUpCmd CLK_SWIMConfig CLK_SYSCLKConfig CLK_SYSCLKEmergencyClear EXTI_DeInit EXTI_GetExtIntSensitivity EXTI_GetTLISensitivity EXTI_SetExtIntSensitivity EXTI_SetTLISensitivity FLASH_DeInit FLASH_EraseByte FLASH_EraseOptionByte FLASH_GetBootSize FLASH_GetFlagStatus FLASH_GetLowPowerMode FLASH_GetProgrammingTime FLASH_ITConfig FLASH_Lock FLASH_ProgramByte FLASH_ProgramOptionByte FLASH_ProgramWord FLASH_ReadByte FLASH_ReadOptionByte FLASH_SetLowPowerMode FLASH_SetProgrammingTime FLASH_Unlock GPIO_DeInit GPIO_ExternalPullUpConfig GPIO_Init GPIO_ReadInputData GPIO_ReadInputPin GPIO_ReadOutputData GPIO_Write GPIO_WriteHigh GPIO_WriteLow GPIO_WriteReverse I2C_AcknowledgeConfig I2C_CheckEvent I2C_ClearFlag I2C_ClearITPendingBit I2C_Cmd I2C_DeInit I2C_FastModeDutyCycleConfig I2C_GeneralCallCmd I2C_GenerateSTART I2C_GenerateSTOP I2C_GetFlagStatus I2C_GetITStatus I2C_GetLastEvent I2C_Init I2C_ITConfig I2C_ReceiveData I2C_Send7bitAddress I2C_SendData I2C_SoftwareResetCmd I2C_StretchClockCmd IN_RAM IN_RAM IN_RAM ITC_DeInit ITC_GetCPUCC ITC_GetSoftIntStatus ITC_GetSoftwarePriority ITC_SetSoftwarePriority IWDG_Enable IWDG_ReloadCounter IWDG_SetPrescaler IWDG_SetReload IWDG_WriteAccessCmd RST_ClearFlag RST_GetFlagStatus SPI_BiDirectionalLineConfig SPI_CalculateCRCCmd SPI_ClearFlag SPI_ClearITPendingBit SPI_Cmd SPI_DeInit SPI_GetCRC SPI_GetCRCPolynomial SPI_GetFlagStatus SPI_GetITStatus SPI_Init SPI_ITConfig SPI_NSSInternalSoftwareCmd SPI_ReceiveData SPI_ResetCRC SPI_SendData SPI_TransmitCRC TI1_Config TI1_Config TI1_Config TI1_Config TI2_Config TI2_Config TI2_Config TI2_Config TI3_Config TI3_Config TI3_Config TI4_Config TIM1_ARRPreloadConfig TIM1_BDTRConfig TIM1_CCPreloadControl TIM1_CCxCmd TIM1_CCxNCmd TIM1_ClearFlag TIM1_ClearITPendingBit TIM1_Cmd TIM1_CounterModeConfig TIM1_CtrlPWMOutputs TIM1_DeInit TIM1_EncoderInterfaceConfig TIM1_ETRClockMode1Config TIM1_ETRClockMode2Config TIM1_ETRConfig TIM1_ForcedOC1Config TIM1_ForcedOC2Config TIM1_ForcedOC3Config TIM1_ForcedOC4Config TIM1_GenerateEvent TIM1_GetCapture1 TIM1_GetCapture2 TIM1_GetCapture3 TIM1_GetCapture4 TIM1_GetCounter TIM1_GetFlagStatus TIM1_GetITStatus TIM1_GetPrescaler TIM1_ICInit TIM1_InternalClockConfig TIM1_ITConfig TIM1_OC1FastConfig TIM1_OC1Init TIM1_OC1NPolarityConfig TIM1_OC1PolarityConfig TIM1_OC1PreloadConfig TIM1_OC2FastConfig TIM1_OC2Init TIM1_OC2NPolarityConfig TIM1_OC2PolarityConfig TIM1_OC2PreloadConfig TIM1_OC3FastConfig TIM1_OC3Init TIM1_OC3NPolarityConfig TIM1_OC3PolarityConfig TIM1_OC3PreloadConfig TIM1_OC4FastConfig TIM1_OC4Init TIM1_OC4PolarityConfig TIM1_OC4PreloadConfig TIM1_PrescalerConfig TIM1_PWMIConfig TIM1_SelectCOM TIM1_SelectHallSensor TIM1_SelectInputTrigger TIM1_SelectMasterSlaveMode TIM1_SelectOCxM TIM1_SelectOnePulseMode TIM1_SelectOutputTrigger TIM1_SelectSlaveMode TIM1_SetAutoreload TIM1_SetCompare1 TIM1_SetCompare2 TIM1_SetCompare3 TIM1_SetCompare4 TIM1_SetCounter TIM1_SetIC1Prescaler TIM1_SetIC2Prescaler TIM1_SetIC3Prescaler TIM1_SetIC4Prescaler TIM1_TimeBaseInit TIM1_TIxExternalClockConfig TIM1_UpdateDisableConfig TIM1_UpdateRequestConfig TIM2_ARRPreloadConfig TIM2_CCxCmd TIM2_ClearFlag TIM2_ClearITPendingBit TIM2_Cmd TIM2_DeInit TIM2_ForcedOC1Config TIM2_ForcedOC2Config TIM2_ForcedOC3Config TIM2_GenerateEvent TIM2_GetCapture1 TIM2_GetCapture2 TIM2_GetCapture3 TIM2_GetCounter TIM2_GetFlagStatus TIM2_GetITStatus TIM2_GetPrescaler TIM2_ICInit TIM2_ITConfig TIM2_OC1Init TIM2_OC1PolarityConfig TIM2_OC1PreloadConfig TIM2_OC2Init TIM2_OC2PolarityConfig TIM2_OC2PreloadConfig TIM2_OC3Init TIM2_OC3PolarityConfig TIM2_OC3PreloadConfig TIM2_PrescalerConfig TIM2_PWMIConfig TIM2_SelectOCxM TIM2_SelectOnePulseMode TIM2_SetAutoreload TIM2_SetCompare1 TIM2_SetCompare2 TIM2_SetCompare3 TIM2_SetCounter TIM2_SetIC1Prescaler TIM2_SetIC2Prescaler TIM2_SetIC3Prescaler TIM2_TimeBaseInit TIM2_UpdateDisableConfig TIM2_UpdateRequestConfig TIM3_ARRPreloadConfig TIM3_CCxCmd TIM3_ClearFlag TIM3_ClearITPendingBit TIM3_Cmd TIM3_DeInit TIM3_ForcedOC1Config TIM3_ForcedOC2Config TIM3_GenerateEvent TIM3_GetCapture1 TIM3_GetCapture2 TIM3_GetCounter TIM3_GetFlagStatus TIM3_GetITStatus TIM3_GetPrescaler TIM3_ICInit TIM3_ITConfig TIM3_OC1Init TIM3_OC1PolarityConfig TIM3_OC1PreloadConfig TIM3_OC2Init TIM3_OC2PolarityConfig TIM3_OC2PreloadConfig TIM3_PrescalerConfig TIM3_PWMIConfig TIM3_SelectOCxM TIM3_SelectOnePulseMode TIM3_SetAutoreload TIM3_SetCompare1 TIM3_SetCompare2 TIM3_SetCounter TIM3_SetIC1Prescaler TIM3_SetIC2Prescaler TIM3_TimeBaseInit TIM3_UpdateDisableConfig TIM3_UpdateRequestConfig TIM4_ARRPreloadConfig TIM4_ClearFlag TIM4_ClearITPendingBit TIM4_Cmd TIM4_DeInit TIM4_GenerateEvent TIM4_GetCounter TIM4_GetFlagStatus TIM4_GetITStatus TIM4_GetPrescaler TIM4_ITConfig TIM4_PrescalerConfig TIM4_SelectOnePulseMode TIM4_SetAutoreload TIM4_SetCounter TIM4_TimeBaseInit TIM4_UpdateDisableConfig TIM4_UpdateRequestConfig TIM5_ARRPreloadConfig TIM5_CCxCmd TIM5_ClearFlag TIM5_ClearITPendingBit TIM5_Cmd TIM5_DeInit TIM5_EncoderInterfaceConfig TIM5_ForcedOC1Config TIM5_ForcedOC2Config TIM5_ForcedOC3Config TIM5_GenerateEvent TIM5_GetCapture1 TIM5_GetCapture2 TIM5_GetCapture3 TIM5_GetCounter TIM5_GetFlagStatus TIM5_GetITStatus TIM5_GetPrescaler TIM5_ICInit TIM5_InternalClockConfig TIM5_ITConfig TIM5_OC1Init TIM5_OC1PolarityConfig TIM5_OC1PreloadConfig TIM5_OC2Init TIM5_OC2PolarityConfig TIM5_OC2PreloadConfig TIM5_OC3Init TIM5_OC3PolarityConfig TIM5_OC3PreloadConfig TIM5_PrescalerConfig TIM5_PWMIConfig TIM5_SelectInputTrigger TIM5_SelectOCxM TIM5_SelectOnePulseMode TIM5_SelectOutputTrigger TIM5_SelectSlaveMode TIM5_SetAutoreload TIM5_SetCompare1 TIM5_SetCompare2 TIM5_SetCompare3 TIM5_SetCounter TIM5_SetIC1Prescaler TIM5_SetIC2Prescaler TIM5_SetIC3Prescaler TIM5_TimeBaseInit TIM5_UpdateDisableConfig TIM5_UpdateRequestConfig TIM6_ARRPreloadConfig TIM6_ClearFlag TIM6_ClearITPendingBit TIM6_Cmd TIM6_DeInit TIM6_GenerateEvent TIM6_GetCounter TIM6_GetFlagStatus TIM6_GetITStatus TIM6_GetPrescaler TIM6_InternalClockConfig TIM6_ITConfig TIM6_PrescalerConfig TIM6_SelectInputTrigger TIM6_SelectMasterSlaveMode TIM6_SelectOnePulseMode TIM6_SelectOutputTrigger TIM6_SelectSlaveMode TIM6_SetAutoreload TIM6_SetCounter TIM6_TimeBaseInit TIM6_UpdateDisableConfig TIM6_UpdateRequestConfig UART1_ClearFlag UART1_ClearITPendingBit UART1_Cmd UART1_DeInit UART1_GetFlagStatus UART1_GetITStatus UART1_HalfDuplexCmd UART1_Init UART1_IrDACmd UART1_IrDAConfig UART1_ITConfig UART1_LINBreakDetectionConfig UART1_LINCmd UART1_ReceiveData8 UART1_ReceiveData9 UART1_ReceiverWakeUpCmd UART1_SendBreak UART1_SendData8 UART1_SendData9 UART1_SetAddress UART1_SetGuardTime UART1_SetPrescaler UART1_SmartCardCmd UART1_SmartCardNACKCmd UART1_WakeUpConfig UART2_ClearFlag UART2_ClearITPendingBit UART2_Cmd UART2_DeInit UART2_GetFlagStatus UART2_GetITStatus UART2_Init UART2_IrDACmd UART2_IrDAConfig UART2_ITConfig UART2_LINBreakDetectionConfig UART2_LINCmd UART2_LINConfig UART2_ReceiveData8 UART2_ReceiveData9 UART2_ReceiverWakeUpCmd UART2_SendBreak UART2_SendData8 UART2_SendData9 UART2_SetAddress UART2_SetGuardTime UART2_SetPrescaler UART2_SmartCardCmd UART2_SmartCardNACKCmd UART2_WakeUpConfig UART3_ClearFlag UART3_ClearITPendingBit UART3_Cmd UART3_DeInit UART3_GetFlagStatus UART3_GetITStatus UART3_Init UART3_ITConfig UART3_LINBreakDetectionConfig UART3_LINCmd UART3_LINConfig UART3_ReceiveData8 UART3_ReceiveData9 UART3_ReceiverWakeUpCmd UART3_SendBreak UART3_SendData8 UART3_SendData9 UART3_SetAddress UART3_WakeUpConfig WWDG_GetCounter WWDG_Init WWDG_SetCounter WWDG_SetWindowValue WWDG_SWReset "+"Set_HSE Set_HSI T4Tick_Init Soft_DelayMs Soft_DelayUs DelayMs_Init DelayMs DelayUs_Init DelayUs Cfg_OPT2 T1_PWM_Init T1_PWM_Duty T2_PWM_Init T2_PWM_Duty Init_UART1 UART1_SendString UART1_SendData UART1_ReceiveByte UART1_printf UART1_SendByte").split(" ");
  var stm8Keywords = [cKeywords];
  stm8Keywords = stm8Keywords.concat(cKeywords, libKeywords);
  CodeMirror.registerHelper("hint", "stm8", function(editor, options) {
    var word = options && options.word || WORD;
    var range = options && options.range || RANGE;
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var start = cur.ch, end = start;
    while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
    while (start && word.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);

    var list = [], seen = {};
    var token = editor.getTokenAt(cur);
    var start0 = token.string;
    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
          var i = arr.length;
          while (i--) {
            if (arr[i] === item) {
              return true;
            }
          }
          return false;
        }
        return arr.indexOf(item) != -1;
    }
    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }
    function maybeAdd(str) {    //str以start开头且当前不在数组中则push入数组
      if (str.indexOf(start0) == 0 && !arrayContains(list, str)) list.push(str);
    }
    function scan(dir) {
      var line = cur.line, end = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
      for (; line != end; line += dir) {
        var text = editor.getLine(line), m;
        var re = new RegExp(word.source, "g");
        while (m = re.exec(text)) {
          if (line == cur.line && m[0] === curWord) continue;
          if ((!curWord || m[0].indexOf(curWord) == 0) && !seen.hasOwnProperty(m[0])) {
            seen[m[0]] = true;
            list.push(m[0]);
          }
        }
      }
    }
    forEach(stm8Keywords, maybeAdd);  //加入语言关键字
    scan(-1);
    scan(1);

    return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
  });
})();
