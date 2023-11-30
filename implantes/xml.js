const fs = require('fs');
const parser = require('fast-xml-parser');

function obtenerDatosLogoSpeechPoint(speechPoint) {

  const resultSpeechPoint = {
    Score: speechPoint?.Score,
    WordsRepeatedCorrect: speechPoint?.WordsRepeatedCorrect,
    Intensity1: speechPoint?.Intensity1,
    Wordlist: speechPoint?.Wordlist,
    Intensity1: speechPoint?.Intensity1,
    IntensityCh1: speechPoint?.IntensityCh1,
    IntensityCh2: speechPoint?.IntensityCh2,
    Intensity1Masked: speechPoint?.Intensity1Masked
  }

  resultSpeechPoint.SpeechWord = []
  if(Array.isArray(speechPoint?.SpeechWord)) {
    for(const speechWord of speechPoint.SpeechWord) {
      resultSpeechPoint.SpeechWord.push({
        Word: speechWord?.Word,
        RepeatedCorrectly: speechWord?.RepeatedCorrectly
      });
    }
  }

  return resultSpeechPoint;
}

function obtenerDatosLogoTest(test) {

  let measureds = test?.Data?.RecordedData?.Measured;
  if(!Array.isArray(measureds)) {
    measureds = [measureds]
  }

  const resultsTests = [];

  for(const measured of measureds) {
    let speech =  measured?.Speech;

    const resultsTest = {
      Earside: speech?.Earside,
      ConductionTypes: speech?.ConductionTypes
    }

    resultsTest.SpeechPoint = [];
    if(Array.isArray(speech?.SpeechPoint)) {
      for(const speechPoint of speech.SpeechPoint) {
        resultsTest.SpeechPoint.push(obtenerDatosLogoSpeechPoint(speechPoint))
      }
    }
    else {
      resultsTest.SpeechPoint.push(obtenerDatosLogoSpeechPoint(speech?.SpeechPoint))
    }

    resultsTests.push(resultsTest)
  }
  return resultsTests;
}

function obtenerDatosLogo(archivo) {

  const xml = parser.parse(fs.readFileSync(archivo, {
    encoding: 'utf8',
    flag: 'r'
  }));

  const results = []

  if(Array.isArray(xml?.SaData.Session?.Test)) {
    for (const test of xml?.SaData.Session?.Test) {
      if(test.TestName === 'Speech') {
        results.push(obtenerDatosLogoTest(test));
      }
    }
  }
  else {
    results.push(obtenerDatosLogoTest(xml?.SaData.Session?.Test));
  }
  return results;
}

function obtenerDatosAudiometria(archivo) {

  const xml = parser.parse(fs.readFileSync(archivo, {
    encoding: 'utf8',
    flag: 'r'
  }));

  const results = []

  const Test = xml?.SaData?.Session?.Test;
  const TestOne = Array.isArray(Test) ? Test.find(t => t.TestName === 'Tone') : Test;

  const Measured = TestOne?.Data?.RecordedData?.Measured;
  const MeasuredArray = Array.isArray(Measured) ? Measured : [Measured];

  for (measure of MeasuredArray) {

    const TonePoint = measure?.Tone?.TonePoint
    const TonePointArray = Array.isArray(TonePoint) ? TonePoint : [TonePoint]

    const record = {
      Earside: measure?.Tone?.Earside,
      SignalType: measure?.Tone?.SignalType,
      ConductionTypes: measure?.Tone?.ConductionTypes,
      Frequency: [],
      IntensityUT: [],
      IntensityMT: [],
      IntensityMTMasked: []
    }

    for (let tonePoint of TonePointArray) {
      record.Frequency.push(tonePoint?.Frequency)
      record.IntensityUT.push(tonePoint?.IntensityUT)
      record.IntensityMT.push(tonePoint?.IntensityMT)
    }

    record.IntensityMTMasked = TonePointArray[0]?.IntensityMTMasked;
    results.push(record);
  }

  return results;
}

function obtenerDatosCorticales(archivo) {

  const data = parser.parse(fs.readFileSync(archivo, {
    encoding: 'utf8',
    flag: 'r'
  }), {
    ignoreAttributes: false
  });

  // const gain = parseInt(data.EPxxWaveforms.Waveform.Gain);
  // const ipsiA = data.EPxxWaveforms.Waveform.Response.IPSI_A_Raw.Value;
  // const ipsiB = data.EPxxWaveforms.Waveform.Response.IPSI_B_Raw.Value;

  // const voltageRatio = Math.pow(10, (gain / 20))
  // const f = 1000000 * (1.6 / voltageRatio) / 32768;
  // const ipsi = ipsiA.map((_, i) => ((f * ipsiA[i] + f * ipsiB[i]) / 2).toFixed(3));

  const nombreArchivo = archivo.slice(archivo.lastIndexOf('/') + 1);;

  const result = {
    id_xml: nombreArchivo,
    filename: nombreArchivo,
    patient_id: data?.EPxxWaveforms?.Waveform?.PatientID,
    protocol: data?.EPxxWaveforms?.Waveform?.TestName,
    stimulus_type: data?.EPxxWaveforms?.Waveform?.StimuliType,
    frequency: data?.EPxxWaveforms?.Waveform?.Burst?.Frequency,
    stimulus_polarity: data?.EPxxWaveforms?.Waveform?.StimulusPolarity,
    stimulus_rate: data?.EPxxWaveforms?.Waveform?.StimulusRate,
    sweeps_measured: data?.EPxxWaveforms?.Waveform?.NumberOfMeasurements,
    sweeps_rejected: data?.EPxxWaveforms?.Waveform?.NumberOfRejected,
    high_pass_hardware: data?.EPxxWaveforms?.Waveform?.HighPassHW,
    low_pass_hardware: data?.EPxxWaveforms?.Waveform?.LowPassHW,
    gain: parseInt(data?.EPxxWaveforms?.Waveform?.Gain),
    ipsi_a: data?.EPxxWaveforms?.Waveform?.Response?.IPSI_A_Raw?.Value,
    ipsi_b: data?.EPxxWaveforms?.Waveform?.Response?.IPSI_B_Raw?.Value,
    contra_a: data?.EPxxWaveforms?.Waveform?.Response?.Contra_A_Raw?.Value,
    contra_b: data?.EPxxWaveforms?.Waveform?.Response?.Contra_B_Raw?.Value
  }

  if ('@_DayOfBirth' in data?.EPxxWaveforms?.Waveform) {
    const value = data?.EPxxWaveforms?.Waveform['@_DayOfBirth'];
    result.birth_date = new Date(value);
  }

  if ('@_Date' in data?.EPxxWaveforms?.Waveform) {
    const value = data?.EPxxWaveforms?.Waveform['@_Date'];
    result.session_date = new Date(value);
  }

  if ('@_StimuliSide' in data?.EPxxWaveforms?.Waveform) {
    result.stimulus_side = data?.EPxxWaveforms?.Waveform['@_StimuliSide'];
  }

  if ('@_Intensity' in data?.EPxxWaveforms?.Waveform) {
    result.intensity = data?.EPxxWaveforms?.Waveform['@_Intensity'];
  }

  return result;
}



module.exports = {
  obtenerDatosLogo,
  obtenerDatosAudiometria,
  obtenerDatosCorticales
}
