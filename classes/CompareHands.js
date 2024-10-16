export default class CompareHands {

  static suits = '♥♦♣♠';
  static ranks = '23456789TJQKA';

  // return the winning hand
  static comparer ( hand1, hand2 ) {
    
   
    // NOTE! This check for identical cards should be commented out
    // during the execution of HIVAT-tests
    
    // if ( this.hasDuplicateCards( hand1, hand2 ) ) {
    //   return { success: false, message: 'Error: There is the same card in both hands.' };
    // }

    let comparers = [
      'isStraightFlush',
      'isFourOfAKind',
      'isFullHouse',
      'isFlush',
      'isStraight',
      'isThreeOfAKind',
      'isTwoPair',
      'isOnePair',
      'isHighestCard'
    ];

    for (let comparer of comparers) {
      let hand1Score = this[comparer](hand1);
      let hand2Score = this[comparer](hand2);
      console.log(comparer, 'hand1Score', hand1Score, 'hand2Score', hand2Score);
      // nobody has this kind combination - continue to next comparer
      if (hand1Score === 0 && hand2Score === 0) { continue; }
      // at least has one hand has this kind of combination
      // which hand won?
      if (hand1Score === hand2Score) { return [hand1, hand2]; }
      else if (hand1Score > hand2Score) { return hand1; }
      else { return hand2; }
    }

  }

  // Function to check for duplicate cards
  static hasDuplicateCards ( hand1, hand2 ) {
    let allCards = [ ...hand1.cards, ...hand2.cards ]; // combine all cards from both hands
    let cardSet = new Set(); // create a Set to store unique cards

    for ( let card of allCards ) {
      let cardKey = `${ card.rank }${ card.suit }`; // key for the card: combination of rank and suit
      if ( cardSet.has( cardKey ) ) {
        // if such a card already exists, a duplicate is found
        return true;
      }
      cardSet.add( cardKey ); // add the card to the Set
    }

    return false; // if no duplicates are found
  }


  static isStraightFlush(hand) {
    // if not straight or not flush -> 0
    // otherwise score of flush
    return this.isFlush( hand ) && this.isStraight( hand );
  } 


  static isFourOfAKind ( hand ) {
    let rankCount = this.getRankCount( hand );
    let fourOfAKindRank = 0;
    let kicker = 0;

    for ( let rank in rankCount ) {
      if ( rankCount[ rank ] === 4 ) {
        fourOfAKindRank = this.rankToPoint( rank ); // save points for the Four of a Kind
      } else if ( rankCount[ rank ] === 1 ) {
        kicker = this.rankToPoint( rank ); // save the kicker (the only remaining card)
        // console.log( "Kicker: ", kicker);
      }
    }
    if ( fourOfAKindRank ) {
      // return points for Four of a Kind and the kicker
      return fourOfAKindRank * 100 + kicker;
    }
    return 0;
  }


  static isFullHouse(hand) { 
    let rankCount = this.getRankCount( hand );
    let hasThree = false, hasTwo = false;
    for ( let rank in rankCount ) {
      if ( rankCount[ rank ] === 3 ) { hasThree = this.rankToPoint( rank ); }
      if ( rankCount[ rank ] === 2 ) { hasTwo = this.rankToPoint( rank ); }
    }
    if ( hasThree && hasTwo ) {
      return hasThree * 100 + hasTwo; // weight 3 of a kind higher than the pair
    }
    return 0;
  }

  static isFlush(hand) {
    let suits = [];
    for (let card of hand.cards) {
      suits.push(card.suit);
    }
    // not a flush -> 0
    if ([...new Set(suits)].length !== 1) {
      return 0;
    }
    // return points depending of strength of flush
    this.sortByRank(hand);
    let score = 0, counter = 0;
    for (let card of hand.cards) {
      score += this.rankToPoint(card.rank) * 10 ** counter;
      counter += 2;
    }
    return score;
  }


  static isStraight ( hand ) { 
    this.sortByRank( hand );
    let ranks = '';
    for ( let card of hand.cards ) {
      ranks += card.rank;
    }
    // if both 2 and A then place A first
    if ( ranks.includes( '2' ) && ranks.includes( 'A' ) ) {
      ranks = 'A' + ranks.slice( 0, 4 ); 
    }
    // not a straight -> 0
    if ( !( 'A' + this.ranks ).includes( ranks ) ) { return 0; };
    // return points depending on strength of straight
    return this.rankToPoint( ranks[ 4 ] );
  } 
  
  static isThreeOfAKind ( hand ) {
    let rankCount = this.getRankCount( hand );
    let threeOfAKindRank = 0;
    let kickers = [];
   
    for ( let rank in rankCount ) {
      if ( rankCount[ rank ] === 3 ) {
        threeOfAKindRank = this.rankToPoint( rank );
      } else {
        kickers.push( this.rankToPoint( rank ) );
      }
    }
    if ( threeOfAKindRank) {
      kickers.sort( ( a, b ) => b - a );
      return threeOfAKindRank * 10000 + kickers[ 0 ] * 100 + kickers[ 1 ];
    }
    return 0;
  }

  static isTwoPair ( hand ) {
    let rankCount = this.getRankCount( hand );
    let pairs = [];
    let kicker = 0;

    for ( let rank in rankCount ) {
      if ( rankCount[ rank ] === 2 ) {
        pairs.push( this.rankToPoint( rank ) ); // store both pairs
      } else {
        kicker = this.rankToPoint( rank ); // save the kicker (the only remaining card)
      }
    }

    if ( pairs.length === 2 ) {
      // sort the pairs from highest to lowest
      pairs.sort( ( a, b ) => b - a );
      // return points for both pairs and add the kicker as an additional value
      return pairs[ 0 ] * 10000 + pairs[ 1 ] * 100 + kicker;;
    }
    return 0;
  }


  static isOnePair ( hand ) {
    let rankCount = this.getRankCount( hand );
    let pair = 0;
    let kickers = [];

    for ( let rank in rankCount ) {
      if ( rankCount[ rank ] === 2 ) {
        pair = this.rankToPoint( rank ); // find the pair
      } else {
        kickers.push( this.rankToPoint( rank ) ); // the remaining cards are kickers
      }
    }
    if ( pair ) {
      // sort the kickers from highest to lowest
      kickers.sort( ( a, b ) => b - a );
      // return points for the pair and kickers as additional values
      return pair * 1000000 + kickers[ 0 ] * 10000 + kickers[ 1 ] * 100 + kickers[ 2 ];
    }
    return 0;
  }

  static isHighestCard(hand) { 
    this.sortByRank( hand );
    let score = 0, counter = 0;
    for ( let card of hand.cards ) {
      score += this.rankToPoint( card.rank ) * 10 ** counter;
      counter += 2;
    }
    return score;
  }

  // helper functions below:

  static rankToPoint ( rank ) {
    return this.ranks.indexOf(rank) + 2;
  }

  static sortByRank(hand) {
    hand.cards = hand.cards.sort((a, b) => {
      return this.rankToPoint(a.rank) < this.rankToPoint(b.rank) ?
        -1 : 1;
    });
  }

  static getRankCount ( hand ) {
    let rankCount = {};
    for ( let card of hand.cards ) {
      if ( !rankCount[ card.rank ] ) {
        rankCount[ card.rank ] = 0;
      }
      rankCount[ card.rank ]++;
    }
    return rankCount;
  }

  
}
