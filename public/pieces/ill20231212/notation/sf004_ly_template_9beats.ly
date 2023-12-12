\version "2.20.0"

\paper{
  paper-width = 130
  paper-height = 100

  top-margin = 0
  bottom-margin = 0
  left-margin = 1
  right-margin = 1
  
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
        % \accidentalStyle dodecaphonic  modern modern-cautionary neo-modern default http://lilypond.org/doc/v2.18/Documentation/notation/displaying-pitches#automatic-accidentals
      }

      {
        \time 9/4
        \override TupletBracket.bracket-visibility = ##t
        \override TupletNumber.visibility = ##f
        %\once \override TupletNumber #'text = "7:4"
        %\set tupletFullLength = ##t %http://lilypond.org/doc/v2.19/Documentation/snippets/rhythms
        
        \override NoteHead.font-size = #-2
        \override DynamicText.font-size = #-2
        
       % \override Stem.details.beamed-lengths = #'(7)
        %\override Stem.details.lengths = #'(7)
        
        
        \override Stem.details.beamed-lengths = #'(5.5)
        \override Stem.details.lengths = #'(5.5)
        \override Stem.details.lengths = #'(5.5)
        
        % \override NoteColumn.accent-skip = ##t
        
        \override Accidental.font-size = -4 
        \stopStaff
        r4    e'4-^\sf    \tuplet 3/2 {e'8-^\sf e' e'}   e'16 e'e'e'   r8. [e'16]   r8 [e'8]   r8 [e'16 e']     e'16 [e' r8]     e'4
        r4    e'4    \tuplet 3/2 {e'8 e' e'}   e'16 e'e'e'   r8. [e'16]   r8 [e'8]   r8 [e'16 e']     e'16 [e' r8]        e'4
        e'4 e'e'e'e'e'e'e'     e'4
        
        % Notes Only, No Staff
        %     \stopStaff
        %         \override NoteHead.transparent = ##t
        %         \override NoteHead.no-ledgers = ##t 
        %         \override Script.transparent = ##t
        %         \override Stem.transparent = ##t  
        %         \override TupletBracket.bracket-visibility = ##f
        %         \override TupletNumber.transparent = ##t
        %         \override Staff.Clef.transparent =##t
        %         \override Staff.BarLine.transparent =##t

        % To Restart Staff After Stopping Staff
        %    \startStaff
        %         \override NoteHead.transparent = ##f
        %         \override NoteHead.no-ledgers = ##f
        %         \override Script.transparent = #f
        %         \override Stem.transparent = ##f
        %         \override TupletBracket.bracket-visibility = ##t
        %         \override TupletNumber.transparent = ##f
        %         \override Staff.Clef.transparent =##f
        %         \override Staff.BarLine.transparent =##f
        
        % Repeats        
        %       \repeat volta 2{
        %          a4 a a a    a a a a    a a a a    a a a a
        %         }         
        
        %https://lilypond.org/doc/v2.20/Documentation/notation/list-of-articulations
        
        
        
      
        
        %           e'4 %quarter
        %           fis'4 %quarter sharp
        %           e'4 %quarter 1 ledger on
        %           cis'4 %quarter sharp 1 ledger on
        %           
        %           a4 %quarter 2 ledger on
        %           g4 %quarter 2 ledger below
        %           gis4 %quarter sharp 2 ledger below 
        %           r4 %rest
        %           
        %           r8 [e'8]%8thR-8th
        %           r8 [fis'8] %8thR-8th sharp
        %           r8 [e'8] %8thR-8th 1 ledger on
        %           r8 [cis'8] %8thR-8th sharp 1 ledger on
        %           
        %           r8 [a8] %8thR-8th 2 ledger on
        %           r8 [g8] %8thR-8th 2 ledger below
        %           r8 [gis8] %8thR-8th sharp 2 ledger below
        %           r8 [e'16 e']% 8thR-16th-16th

        % 
        %           r8 [fis'16 fis']% 8thR-16th-16th sharp
        %           r8 [e'16 e']% 8thR-16th-16th 1 ledger on
        %           r8 [cis'16 cis']% 8thR-16th-16th sharp 1 ledger on
        %           r8 [a16 a]% 8thR-16th-16th 2 ledgers on
        % 
        %           r8 [g16 g]% 8thR-16th-16th 2 ledgers below
        %           r8 [gis16 gis]% 8thR-16th-16th sharp 2 ledgers below
        %           e'16 [e' r8] % 16th-16th-8thR
        %           fis'16 [fis' r8] % 16th-16th-8thR sharp
        % 
        %           e'16 [e' r8] % 16th-16th-8thR 1 ledger on
        %           cis'16 [cis' r8] % 16th-16th-8thR sharp 1 ledger on
        %           a16 [a r8] % 16th-16th-8thR 2 ledgers on
        %           g16 [g r8] % 16th-16th-8thR 2 ledgers below
        % 
        %           gis16 [gis] r8 % 16th-16th-8thR sharp 2 ledgers below
        %           r8. [e'16]  % Dt8thR-16th
        %           r8. [fis'16]  % Dt8thR-16th sharp
        %           r8. [e'16]  % Dt8thR-16th 1 ledger on
        %           
        % 
        %           r8. [cis'16]  % Dt8thR-16th sharp 1 ledger on
        %           r8. [a16]  % Dt8thR-16th sharp 2 ledgers on
        %           r8. [g16]  % Dt8thR-16th  2 ledgers below
        %           r8. [gis16]  % Dt8thR-16th sharp 2 ledgers below
        %           
        %           \tuplet 3/2 {e'8 e'e'} % Triplet
        %           \tuplet 3/2 {fis'8 fis'fis'} % Triplet sharp
        %           \tuplet 3/2 {e'8 e'e'} % Triplet 1 ledger on
        %           \tuplet 3/2 {cis'8 cis'cis'} % Triplet sharp 1 ledger on
        %           
        %           \tuplet 3/2 {a8 a a} % Triplet 2 ledgers on
        %           \tuplet 3/2 {g8 g g} % Triplet 2 ledgers below
        %           \tuplet 3/2 {gis8 gis gis} % Triplet sharp 2 ledgers below
        %           e'16 e'e'e' % Quadruplet
        %           
        %           fis'16 fis' fis' fis' % Quadruplet sharp
        %           e'16 e' e' e' % Quadruplet 1 ledger on
        %           cis'16 cis' cis' cis' % Quadruplet sharp 1 ledger on
        %           a16 a a a % Quadruplet  2 ledgers on
        %           
        
        %    g16 g g g % Quadruplet 2 ledgers below
        %           gis16 gis gis gis % Quadruplet sharp 2 ledgers below
        %            \tuplet 5/4 {e'16 e' e' e' e'} % Quintuplet
        %            \tuplet 5/4 {fis'16 fis' fis' fis' fis'} % Quintuplet sharp
        %          
        %            \tuplet 5/4 {e'16 e' e' e' e'} % Quintuplet 1 ledger on
        %            \tuplet 5/4 {cis'16 cis' cis' cis' cis'} % Quintuplet sharp 1 ledger on
        %            \tuplet 5/4 {a16 a a a a} % Quintuplet 2 ledgers on
        %            \tuplet 5/4 {g16 g g g g} % Quintuplet 2 ledgers below
        %            
        %            \tuplet 5/4 {gis16 gis gis gis gis} % Quintuplet sharp 2 ledgers below
        %            e'4e'e'e' e'e'e'
        
        %  e'16e'e'e'  
        %           e'4        
        %           \tuplet 5/4 {e'''16\hide-> e'''e'''e'''e'''}       
        %           \tuplet 5/4 {f16\hide-> f f f f} 
        %           
        %           e'4  
        %           e'4 
        %           \tuplet 5/4 {    f16\hide-> f f f f }            
        %           \tuplet 5/4 {e'''16\hide-> e'''e'''e'''e'''}  
        
        
        
        
        
        
        
        
      }

    >>

    \layout{
      \context {
        \Score
        %proportionalNotationDuration = #(ly:make-moment 1/20) %smallest space quintuplet or 5*4
        proportionalNotationDuration = #(ly:make-moment 1/16) %smallest space quintuplet or 5*4

        %proportionalNotationDuration = #(ly:make-moment 1/28)
        %proportionalNotationDuration = #(ly:make-moment 1/8)
        %\override SpacingSpanner.uniform-stretching = ##t
        %  \override SpacingSpanner.strict-note-spacing = ##t
        %  \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
        % \override NoteHead.no-ledgers = ##t 
      }

      indent = 0
      %line-width = 158
      line-width = 120
      #(layout-set-staff-size 20) %staff height
      % \hide Stem
      %\hide NoteHead
      % \hide LedgerLineSpanner
      % \hide TupletNumber 
    }

    \midi{}

  }
}

