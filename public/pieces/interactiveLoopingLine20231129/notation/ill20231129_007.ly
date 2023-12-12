\version "2.20.0"
%Make a single line version in Lilypond and then cut up and resize in inkscape
%50 pixels per beat

\paper{
  paper-width = 1000
  paper-height = 100

  top-margin = 0
  bottom-margin = 0
  left-margin = 0
  right-margin = 0
  
  system-system-spacing =
  #'((basic-distance . 15)  %this controls space between lines default = 12
                            (minimum-distance . 8)
                            (padding . 1)
                            (stretchability . 60)) 

}

\book {

  \header {
    tagline = ##f %Do not display tagline
  }

  \score {

    <<

      \override Score.BarNumber.break-visibility = ##(#f #f #f) %The order of the three values is end of line visible, middle of line visible, beginning of line visible.

      \new Staff \with {
        \omit TimeSignature
        \omit BarLine
        \omit Clef
        \omit KeySignature
        \override StaffSymbol.thickness = #1 %thickness of stafflines, ledger lines, and stems
      }

      {
        \time 29/4
        \override TupletBracket.bracket-visibility = ##t
        \override TupletNumber.visibility = ##f
        \set tupletFullLength = ##t %http://lilypond.org/doc/v2.19/Documentation/snippets/rhythms
        \override NoteHead.font-size = #-2
        \override DynamicText.font-size = #-2
        \override Stem.details.beamed-lengths = #'(9)
        \override Stem.details.lengths = #'(9)
        \stopStaff
        \set Score.tempoHideNote = ##t
        \tempo 4 = 60
        \override TupletBracket.padding = 2





        [f''16 e'8.~] e'4
        \tuplet 5/4 {b16 c' a' g'' a''~} a''8 
        c''2 c2. r8
        b''8 d'8  f'''16 e'' e' f
        \tuplet 5/4 {c' c' c' c' c'~} c'16 c'''8.  b,1
  
        \tuplet 3/2 {e'4 a8}
        
        \once \override TupletNumber.text =
        #(tuplet-number::non-default-tuplet-fraction-text 5 2)
        
        \tuplet 5/4 {g''8 b' c' g'' c'}
        
        \tuplet 3/2 {a'4 d'8}
        \once \override TupletNumber #'text = "5:2"
        \tuplet 5/4 {c'''8 f'' g' d''' g'}
        
        
        f'16 a' d' f''
        \once \override TupletNumber #'text = "7:1"

        \tuplet 7/8 {a'32 c'' e'' g'' b'' d''' a'''}

        c,,1
        

              
        
      }

    >>

    \layout{
      \context {
        \Score
        proportionalNotationDuration = #(ly:make-moment 1/20) %smallest space quintuplet or 5*4


       % \override SpacingSpanner.uniform-stretching = ##t
      % Turning on strict-note-spacing causes the width of time signatures, key signatures, clefs and accidentals to play no part in the spacing algorithm.
        \override SpacingSpanner.strict-note-spacing = ##t
        \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
        % \override NoteHead.no-ledgers = ##t 
      }

      indent = 0
      %line-width = 158
      line-width = 1000
      #(layout-set-staff-size 33) %staff height
      % \hide Stem
      %\hide NoteHead
      % \hide LedgerLineSpanner
      % \hide TupletNumber 
    }

    \midi{}

  }
}

