setcpm(80)

$: s("gm_acoustic_bass ballwhistle gm_pad_bowed:1 supersaw sawtooth").gain(0.90).release(.5)
$: n("0 1 2 3").s("gm_pad_warm gm_synth_bass_1 woodblock:1 woodblock:2*2 snare_rim:0 gong 8 brakedrum:1 ~").release(.1).gain(.5)
$: s("bd*4 bd!4 ~").slow(2.7928).gain(.5)
$: s("perc*3 bd!4").bank("BossDR550").lpf(800).gain(0.90).release(1.219).attack(.1926)
